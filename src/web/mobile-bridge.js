/**
 * WebSocket server for mobile Claude connections (non-PTY).
 *
 * Handles WebSocket upgrade requests on /ws/mobile, authenticates via
 * query-param token, and bridges claude -p (print mode) over the WebSocket.
 *
 * Architecture: one claude process per message turn, resumed via session ID.
 *   1. Client connects → WebSocket ready, no process yet.
 *   2. Client sends { type: 'input', content: '...' }
 *   3. Bridge spawns: claude -p --verbose --output-format stream-json [--resume X]
 *   4. Writes user text to stdin, closes stdin (triggers EOF → Claude generates).
 *   5. Streams output lines back as parsed JSON.
 *   6. On process exit, extracts session_id from result message, sends turn_complete.
 *   7. Client can send next message → new claude process with --resume <session_id>.
 *
 * Usage:
 *   const { attachMobileWebSocket } = require('./mobile-bridge');
 *   attachMobileWebSocket(httpServer);
 */

const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const readline = require('readline');
const url = require('url');
const { isValidToken } = require('./auth');

// ─── Input Sanitization ─────────────────────────────────────
const isSafeModel = (v) => v && typeof v === 'string' && /^[a-zA-Z0-9._:-]+$/.test(v) && v.length <= 100;
const isSafeSessionId = (v) => v && typeof v === 'string' && /^[a-zA-Z0-9_-]+$/.test(v) && v.length <= 100;
const isSafeDir = (v) => v && typeof v === 'string' && v.length <= 500 && !/[;&|`$(){}[\]<>!#*?\n\r]/.test(v);

/**
 * Attach a WebSocket server to an existing HTTP server for mobile Claude access.
 *
 * @param {import('http').Server} httpServer
 * @returns {{ mobileWss: WebSocketServer }}
 */
function attachMobileWebSocket(httpServer) {
  const mobileWss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const { pathname, query } = url.parse(request.url, true);

    console.log(`[Mobile] upgrade request: ${request.url} → pathname="${pathname}"`);

    if (pathname !== '/ws/mobile') return;

    const token = query.token;
    console.log(`[Mobile] token present: ${!!token}, valid: ${isValidToken(token)}`);
    if (!isValidToken(token)) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      console.log('[Mobile] Rejected unauthenticated WebSocket upgrade');
      return;
    }

    const sessionId = query.sessionId;
    console.log(`[Mobile] sessionId: ${sessionId}`);
    if (!sessionId) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      console.log('[Mobile] Rejected WebSocket upgrade: missing sessionId');
      return;
    }

    mobileWss.handleUpgrade(request, socket, head, (ws) => {
      mobileWss.emit('connection', ws, request);

      // claudeSessionId tracks the --resume value across turns within this WS connection
      let claudeSessionId = (query.resumeSessionId && isSafeSessionId(query.resumeSessionId))
        ? query.resumeSessionId
        : null;

      let activeChild = null; // current claude process, if any

      // ─── Spawn claude for one turn ─────────────────────────
      function spawnTurn(userMessage) {
        const args = ['-p', '--verbose', '--output-format', 'stream-json'];

        if (claudeSessionId) {
          args.push('--resume', claudeSessionId);
        }
        if (query.model && isSafeModel(query.model)) {
          args.push('--model', query.model);
        }

        const spawnOpts = { stdio: ['pipe', 'pipe', 'pipe'] };
        if (query.workingDir && isSafeDir(query.workingDir)) {
          spawnOpts.cwd = query.workingDir;
        }

        console.log(`[Mobile] Spawning claude (resume=${claudeSessionId || 'none'}) for session ${sessionId}`);
        const child = spawn('claude', args, spawnOpts);
        activeChild = child;

        // Write user message as plain text then EOF — this is what -p mode expects
        child.stdin.write(userMessage);
        child.stdin.end();

        let lastResultMsg = null;

        // ─── stdout → WebSocket ─────
        const stdoutRL = readline.createInterface({ input: child.stdout });
        stdoutRL.on('line', (line) => {
          if (ws.readyState !== ws.OPEN) return;
          try {
            const parsed = JSON.parse(line);
            // Capture session_id from result message for next turn
            if (parsed.type === 'result' && parsed.session_id) {
              lastResultMsg = parsed;
              claudeSessionId = parsed.session_id;
            }
            ws.send(JSON.stringify(parsed));
          } catch {
            ws.send(JSON.stringify({ type: 'system', subtype: 'raw', content: line }));
          }
        });

        // ─── stderr → WebSocket ─────
        const stderrRL = readline.createInterface({ input: child.stderr });
        stderrRL.on('line', (line) => {
          if (ws.readyState !== ws.OPEN) return;
          ws.send(JSON.stringify({ type: 'system', subtype: 'stderr', content: line }));
        });

        // ─── Exit → send turn_complete, keep WS alive for next message ─────
        child.on('exit', (exitCode) => {
          activeChild = null;
          stdoutRL.close();
          stderrRL.close();
          console.log(`[Mobile] Turn complete for session ${sessionId} (code ${exitCode}, claudeSession=${claudeSessionId || 'none'})`);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'system',
              subtype: 'turn_complete',
              exitCode,
              claudeSessionId: claudeSessionId || null,
            }));
          }
        });

        child.on('error', (err) => {
          activeChild = null;
          console.error(`[Mobile] Failed to spawn claude for session ${sessionId}:`, err.message);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'system', subtype: 'error', content: err.message }));
          }
        });
      }

      // ─── WebSocket message → spawn turn ─────────────────────
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type !== 'input' || !msg.content) return;

          if (activeChild) {
            // Previous turn still running — reject until complete
            ws.send(JSON.stringify({
              type: 'system',
              subtype: 'error',
              content: 'Previous turn still in progress. Wait for turn_complete.',
            }));
            return;
          }

          spawnTurn(msg.content);
        } catch {
          ws.send(JSON.stringify({ type: 'system', subtype: 'error', content: 'Invalid JSON message' }));
        }
      });

      // ─── WebSocket close/error → kill active turn ─────────
      ws.on('close', () => {
        console.log(`[Mobile] WebSocket closed for session ${sessionId}`);
        if (activeChild) activeChild.kill('SIGTERM');
      });

      ws.on('error', (err) => {
        console.error(`[Mobile] WebSocket error for session ${sessionId}:`, err.message);
        if (activeChild) activeChild.kill('SIGTERM');
      });
    });
  });

  console.log('[Mobile] Mobile WebSocket server attached on /ws/mobile');
  return { mobileWss };
}

module.exports = { attachMobileWebSocket };
