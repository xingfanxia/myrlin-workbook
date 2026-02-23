/**
 * WebSocket server for mobile Claude connections (non-PTY).
 *
 * Handles WebSocket upgrade requests on /ws/mobile, authenticates via
 * query-param token, and spawns a Claude process in stream-json mode
 * bridged over the WebSocket.
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

// ─── Input Sanitization (mirrors pty-server.js validators) ─────
const isSafeModel = (v) => v && typeof v === 'string' && /^[a-zA-Z0-9._:-]+$/.test(v) && v.length <= 100;
const isSafeSessionId = (v) => v && typeof v === 'string' && /^[a-zA-Z0-9_-]+$/.test(v) && v.length <= 100;
const isSafeDir = (v) => v && typeof v === 'string' && v.length <= 500 && !/[;&|`$(){}[\]<>!#*?\n\r]/.test(v);

/**
 * Attach a WebSocket server to an existing HTTP server for mobile Claude access.
 *
 * Listens for upgrade requests on `/ws/mobile` with query parameters:
 *   - token: Required. Valid auth token.
 *   - sessionId: Required. Logical session identifier for this connection.
 *   - resumeSessionId: Optional. Claude session ID to resume.
 *   - model: Optional. Model name to use.
 *   - workingDir: Optional. Working directory for the Claude process.
 *
 * @param {import('http').Server} httpServer - The Node.js HTTP server instance
 * @returns {{ mobileWss: WebSocketServer }}
 */
function attachMobileWebSocket(httpServer) {
  const mobileWss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const { pathname, query } = url.parse(request.url, true);

    // Only handle /ws/mobile upgrades — let all other paths fall through
    if (pathname !== '/ws/mobile') {
      return;
    }

    // Authenticate via query param token
    const token = query.token;
    if (!isValidToken(token)) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      console.log('[Mobile] Rejected unauthenticated WebSocket upgrade');
      return;
    }

    const sessionId = query.sessionId;
    if (!sessionId) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      console.log('[Mobile] Rejected WebSocket upgrade: missing sessionId');
      return;
    }

    // Complete the WebSocket handshake
    mobileWss.handleUpgrade(request, socket, head, (ws) => {
      mobileWss.emit('connection', ws, request);

      // Build claude command args
      const args = ['-p', '--output-format', 'stream-json', '--input-format', 'stream-json'];

      if (query.resumeSessionId && isSafeSessionId(query.resumeSessionId)) {
        args.push('--resume', query.resumeSessionId);
      }
      if (query.model && isSafeModel(query.model)) {
        args.push('--model', query.model);
      }

      const spawnOpts = {
        stdio: ['pipe', 'pipe', 'pipe'],
      };
      if (query.workingDir && isSafeDir(query.workingDir)) {
        spawnOpts.cwd = query.workingDir;
      }

      console.log(`[Mobile] Spawning claude for session ${sessionId}`);
      const child = spawn('claude', args, spawnOpts);

      let exited = false;

      // ─── stdout → WebSocket (line-by-line JSON) ─────
      const stdoutRL = readline.createInterface({ input: child.stdout });
      stdoutRL.on('line', (line) => {
        if (ws.readyState !== ws.OPEN) return;
        try {
          const parsed = JSON.parse(line);
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

      // ─── Process exit → notify client ─────
      child.on('exit', (exitCode) => {
        exited = true;
        console.log(`[Mobile] Claude process exited for session ${sessionId} (code ${exitCode})`);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'system', subtype: 'exit', exitCode: exitCode }));
          ws.close();
        }
        stdoutRL.close();
        stderrRL.close();
      });

      child.on('error', (err) => {
        console.error(`[Mobile] Failed to spawn claude for session ${sessionId}:`, err.message);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'system', subtype: 'error', content: err.message }));
          ws.close();
        }
      });

      // ─── WebSocket message → stdin ─────
      ws.on('message', (data) => {
        if (exited) return;
        try {
          const msg = JSON.parse(data.toString());
          child.stdin.write(JSON.stringify(msg) + '\n');
        } catch {
          ws.send(JSON.stringify({ type: 'system', subtype: 'error', content: 'Invalid JSON message' }));
        }
      });

      // ─── WebSocket close/error → kill process ─────
      ws.on('close', () => {
        console.log(`[Mobile] WebSocket closed for session ${sessionId}`);
        if (!exited) {
          child.kill('SIGTERM');
        }
      });

      ws.on('error', (err) => {
        console.error(`[Mobile] WebSocket error for session ${sessionId}:`, err.message);
        if (!exited) {
          child.kill('SIGTERM');
        }
      });
    });
  });

  console.log('[Mobile] Mobile WebSocket server attached on /ws/mobile');
  return { mobileWss };
}

module.exports = { attachMobileWebSocket };
