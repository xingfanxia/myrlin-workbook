# Myrlin Web GUI — Feature Inventory

## Pages / Views

1. **Login Screen** (`id="login-screen"`)
   - Password-based authentication with Bearer token generation
   - Theme picker (12 themes: Mocha, Macchiato, Frappé, Nord, Dracula, Tokyo Night, Cherry, Ocean, Amber, Mint, Latte, Rose Pine Dawn, Gruvbox Light)
   - Password visibility toggle
   - Error/status display

2. **Terminal View** (default view, `data-mode="terminal"`)
   - Main workspace showing Claude Code sessions in terminal emulation (xterm-256color)
   - WebSocket connection for real-time PTY stream
   - Scrollback buffer replay on reconnect
   - Supports multiple concurrent sessions with tab-based UI
   - Terminal resizing, input/output handling
   - Session status indicators (running/stopped)

3. **Workspace View** (`data-mode="workspace"`)
   - Lists all workspaces (workspace metadata and groups)
   - Create new workspace dialog
   - Rename workspace functionality
   - Delete workspace functionality
   - Reorder workspaces (drag-and-drop)
   - Activate workspace (make current)
   - Group management and sidebar display

4. **Tasks View** (`data-mode="tasks"`)
   - Kanban-style task board (columns: todo, in_progress, completed, etc.)
   - Task drag-and-drop between columns
   - Task creation dialog with branch name preview
   - Task status management (move between columns)
   - Task blocking relationships (task dependencies)
   - Task model selection (override session model)
   - Task tagging system
   - Task deletion
   - Task-to-PR workflow
   - Spinoff task batch creation
   - New task dialog with directory context picker

5. **Costs View** (`data-mode="costs"`)
   - Cost dashboard with period selector (day/week/month/all)
   - Per-session cost breakdown
   - Workspace-level cost analytics
   - Token usage statistics
   - Cost trend visualization
   - Manual cost refresh button
   - Quota overview display

6. **Recent View** (`data-mode="recent"`)
   - Recently accessed sessions and workspaces
   - Quick-launch for frequently used items

7. **Docs View** (`data-mode="docs"`)
   - Workspace documentation viewer/editor
   - Multiple doc sections: Notes, Goals, Tasks, Roadmap, Rules
   - Rich markdown editing
   - Add/edit/delete document entries
   - Raw markdown toggle and save
   - Per-section management

8. **Resources View** (`data-mode="resources"`)
   - System resource monitoring (CPU, memory, disk)
   - Process listing with resource usage
   - Process killing capability
   - Git status and worktree management
   - Branch and worktree visualization
   - Auto-refresh on tab visibility change

## Features per Page

### Terminal View
- **Session Management**
  - Display active/stopped sessions
  - Session sidebar with filtering (all/running/stopped)
  - Quick session search (Cmd+K / Ctrl+K)
  - Session renaming
  - Session deletion
  - Session tags/labels
  - Bypassable permissions flag toggle
  - Verbose mode toggle
  - Agent teams enablement toggle
  - Model override per session
  - Start/stop/restart buttons
  - Batch restart all sessions

- **Session Creation**
  - Create new session in workspace
  - Session templates (save/load)
  - Auto-discover Claude sessions
  - Create from directory browser
  - Resume previous Claude sessions (via resumeSessionId)
  - Custom command override
  - Working directory picker
  - Model selection
  - Bypass permissions flag
  - Verbose output flag
  - Agent teams flag

- **PTY Terminal Features**
  - Real-time output streaming via WebSocket
  - Raw terminal output with ANSI support
  - Input/output handling
  - Terminal resizing (cols/rows)
  - Scrollback preservation (100KB buffer)
  - Reconnection with scrollback replay
  - Fallback UI display (server unavailable banner)
  - Image upload capability

- **Session Context Actions**
  - Export context (full session log)
  - Extract tasks from session
  - Spinoff context (create new session from context)
  - Batch spinoff (multiple sessions from one)
  - Session summarization
  - Auto-title generation
  - Session refocus functionality
  - Subagent tracking display

- **Terminal Interactions**
  - Quick session switcher overlay
  - Context menu (right-click actions)
  - Keyboard shortcuts (Ctrl+C to send signal, custom commands)
  - Session manager overlay (multi-select stop)
  - Terminal idle/activity detection
  - Terminal needs input signal

### Workspace View
- **Workspace Management**
  - Create new workspace
  - Rename workspace
  - Delete workspace
  - Activate workspace (set as current)
  - Reorder workspaces via drag-and-drop
  - Workspace grouping

- **Group Management**
  - Create group
  - Rename group
  - Delete group
  - Add sessions to group
  - Group-level operations

- **Workspace Documentation**
  - View/edit workspace notes
  - View/edit workspace goals
  - View/edit workspace tasks
  - View/edit workspace roadmap
  - View/edit workspace rules
  - Raw markdown editing mode
  - Add/edit/delete document entries per section

- **Feature Board**
  - Create features
  - Assign features to sessions
  - Remove features from sessions
  - Feature tracking

- **Analytics & Insights**
  - Workspace cost breakdown
  - Workspace analytics dashboard
  - File conflict center
  - Conflict resolution UI

### Tasks/Worktree View
- **Worktree Task Management**
  - Create new task (generates git worktree + branch)
  - Task status columns (todo/in_progress/completed/blocked)
  - Drag-drop task between columns
  - Edit task name/description
  - Task blocking relationships (set/clear blockers)
  - Task model override
  - Task tagging
  - Delete task
  - Task priority/ordering

- **Git Integration**
  - Worktree creation
  - Branch management
  - Automatic branch naming from task name
  - Working directory preview
  - Git status view
  - Worktree cleanup

- **PR Workflow**
  - Create PR from task
  - Generate PR description (AI-generated)
  - PR status tracking
  - View PR URL
  - PR metadata storage

- **Spinoff Functionality**
  - Extract tasks from session context
  - Batch create tasks
  - Task setup wizards

- **Task Lifecycle**
  - Task initialization hooks setup
  - Task merge/push workflow
  - Task rejection capability
  - Changes/diff viewing
  - Custom diff viewing

### Costs View
- **Cost Tracking**
  - Per-session cost display (by model, by date)
  - Workspace aggregate costs
  - Period-based filtering (day/week/month/all)
  - Token usage (input/output)
  - Cost trend charts
  - Quota overview (usage vs. limits)

- **Analytics**
  - Cost dashboard (cross-workspace view)
  - Pricing model insights
  - Usage patterns

### Resources View
- **System Monitoring**
  - CPU usage (per-process and total)
  - Memory usage (per-process and total)
  - Disk usage
  - Uptime tracking

- **Process Management**
  - Process listing with PID, status, resource usage
  - Kill process capability
  - PTY orphan detection/killing
  - System resource refresh

- **Git Integration**
  - Git status (staged, modified, untracked files)
  - Branch list with tracking info
  - Worktree list with paths
  - Create new worktree from UI
  - Delete worktree capability
  - Worktree status display

### Docs View
- **Documentation Management**
  - Multi-section document structure (Notes, Goals, Tasks, Roadmap, Rules)
  - Add/edit/delete entries per section
  - Markdown rendering
  - Raw markdown editing mode
  - Save/discard changes
  - Workspace documentation persistence

### Recent/Discover View
- **Session Discovery**
  - Scan ~/.claude/projects for existing Claude sessions
  - Auto-detect session metadata
  - Quick-launch existing sessions
  - Session history

## REST API Endpoints

### Authentication (public, no requireAuth for login)
- `POST /api/auth/login` - Validate password, return Bearer token
- `POST /api/auth/logout` - Invalidate token (Bearer auth)
- `GET /api/auth/check` - Check token validity (public query)

### Health & Status
- `GET /api/health` - Server health check (public)
- `GET /api/fallback/status` - Fallback UI status
- `POST /api/fallback/restore` - Restore frontend from backup

### Workspaces (CRUD + operations)
- `GET /api/workspaces` - List all workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace (rename, etc.)
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/activate` - Set as active workspace
- `PUT /api/workspaces/reorder` - Reorder workspace list

### Workspace Documentation
- `GET /api/workspaces/:id/docs` - Get all docs for workspace
- `PUT /api/workspaces/:id/docs` - Update docs (bulk)
- `POST /api/workspaces/:id/docs/notes` - Add note
- `POST /api/workspaces/:id/docs/goals` - Add goal
- `POST /api/workspaces/:id/docs/tasks` - Add task entry
- `POST /api/workspaces/:id/docs/roadmap` - Add roadmap item
- `POST /api/workspaces/:id/docs/rules` - Add rule
- `PUT /api/workspaces/:id/docs/:section/:index` - Edit doc entry
- `DELETE /api/workspaces/:id/docs/:section/:index` - Delete doc entry

### Workspace Features & Analytics
- `GET /api/workspaces/:id/features` - List features
- `POST /api/workspaces/:id/features` - Create feature
- `GET /api/workspaces/:id/cost` - Workspace cost breakdown
- `GET /api/workspaces/:id/analytics` - Workspace analytics
- `GET /api/workspaces/:id/conflicts` - File conflicts in workspace

### Groups (session grouping)
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/add` - Add session(s) to group

### Sessions (CRUD + lifecycle)
- `GET /api/sessions` - List sessions (supports mode=all, workspace-filtered)
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session (rename, tags, model, flags, etc.)
- `DELETE /api/sessions/:id` - Delete session
- `POST /api/sessions/:id/start` - Start session
- `POST /api/sessions/:id/stop` - Stop session
- `POST /api/sessions/:id/restart` - Restart session

### Session Context & Intelligence
- `POST /api/sessions/:id/auto-title` - Auto-generate session title (AI)
- `POST /api/sessions/:id/summarize` - Generate session summary (AI)
- `GET /api/sessions/:id/export-context` - Export full session context/logs
- `POST /api/sessions/:id/extract-tasks` - Extract tasks from session (AI)
- `POST /api/sessions/:id/spinoff-context` - Create new session from context
- `POST /api/sessions/:id/spinoff-batch` - Batch create sessions from one
- `POST /api/sessions/:id/refocus` - Refocus session (reset focus state)
- `GET /api/sessions/:id/subagents` - Get subagent tracking data

### Session Metrics
- `GET /api/sessions/:id/cost` - Per-session cost breakdown
- `GET /api/stats` - Overall statistics
- `GET /api/quota-overview` - Token quota status
- `GET /api/cost/dashboard` - Cost dashboard (cross-workspace)

### Templates
- `GET /api/templates` - List session templates
- `POST /api/templates` - Save session as template
- `DELETE /api/templates/:id` - Delete template

### Features
- `POST /api/features/:id/sessions/:sessionId` - Assign feature to session
- `DELETE /api/features/:id/sessions/:sessionId` - Remove feature from session
- `PUT /api/features/:id` - Update feature
- `DELETE /api/features/:id` - Delete feature

### PTY (Pseudo-Terminal)
- `GET /api/pty` - List active PTY sessions
- `POST /api/pty/:sessionId/kill` - Kill PTY session
- `POST /api/pty/kill-orphaned` - Kill orphaned PTY processes
- `POST /api/pty/:sessionId/upload-image` - Upload image to session PTY

### Git Integration
- `GET /api/git/status` - Get git repo status (staged, modified, untracked)
- `GET /api/git/branches` - List branches
- `GET /api/git/worktrees` - List git worktrees
- `POST /api/git/worktrees` - Create new worktree (with branch)
- `DELETE /api/git/worktrees` - Delete worktree

### Worktree Tasks (feature branch management)
- `GET /api/worktree-tasks` - List all worktree tasks
- `GET /api/worktree-tasks/:id` - Get task details
- `POST /api/worktree-tasks` - Create new task (spawns worktree)
- `PUT /api/worktree-tasks/:id` - Update task (status, blockers, model, tags)
- `DELETE /api/worktree-tasks/:id` - Delete task
- `GET /api/worktree-tasks/:id/changes` - Get diff/changes for task
- `POST /api/worktree-tasks/:id/diff` - Request detailed diff
- `POST /api/worktree-tasks/:id/merge` - Merge task (cherry-pick/squash)
- `POST /api/worktree-tasks/:id/push` - Push task to remote
- `POST /api/worktree-tasks/:id/reject` - Reject task (don't merge)
- `GET /api/worktree-tasks/:id/pr` - Get PR status/info
- `POST /api/worktree-tasks/:id/pr` - Create PR for task
- `POST /api/worktree-tasks/:id/pr/generate-description` - AI-generate PR description
- `GET /api/worktree-init-hooks` - Get init hooks config
- `PUT /api/worktree-init-hooks` - Update init hooks config

### Tunnels (for remote access)
- `GET /api/tunnels` - List tunnel configs
- `POST /api/tunnels` - Create tunnel
- `DELETE /api/tunnels/:id` - Delete tunnel
- `GET /api/tunnel/named` - Get named tunnel status
- `PUT /api/tunnel/named/config` - Configure named tunnel
- `POST /api/tunnel/named/start` - Start named tunnel
- `POST /api/tunnel/named/stop` - Stop named tunnel

### Search & Browse
- `GET /api/search` - Full-text search (sessions, workspaces, docs)
- `POST /api/search-conversations` - Search conversation history
- `GET /api/browse` - Browse file system (directory listing)

### Layout & Persistence
- `GET /api/layout` - Get UI layout state (sidebar collapsed, etc.)
- `PUT /api/layout` - Save UI layout state

### Resources
- `GET /api/resources` - Get system resource status (CPU, memory, disk, processes)
- `POST /api/resources/kill-process` - Kill process by PID

### Discovery & Version
- `GET /api/discover` - Auto-discover Claude sessions from ~/.claude/projects
- `GET /api/version` - Get server version
- `POST /api/update` - Check for and perform update

### Session Cleanup
- `DELETE /api/refocus-cleanup` - Cleanup refocus state

## WebSocket Features

### PTY WebSocket (`/ws/pty`)
- **Connection**: Authenticates via Bearer token query param or header
- **Session Persistence**: Each session maintains scrollback (100KB buffer)
- **Messages**:
  - Outbound (server → client): Raw terminal output (ANSI sequences) + JSON control messages
  - Inbound (client → server): `{type: "input", data: "..."}` for terminal input, `{type: "resize", cols, rows}` for resizing
- **Reconnection**: Automatic scrollback replay on reconnect
- **Exit Handling**: JSON message `{type: "exit", exitCode}` on session termination
- **Keepalive**: Ping/pong every 30s to maintain connection through firewalls
- **Backpressure**: Skips overwhelmed clients (>64KB buffer) to keep others responsive

### Mobile WebSocket (`/ws/mobile`)
- **Connection**: Query params: `token`, `sessionId`, `resumeSessionId` (optional), `model` (optional), `workingDir` (optional)
- **Protocol**: One turn per message (spawn Claude, get output, exit, repeat)
- **Messages**:
  - Inbound: `{type: "input", content: "user message"}`
  - Outbound: JSON stream (parsed claude output) + `{type: "system", subtype: "turn_complete", exitCode, claudeSessionId}`
- **Session Resume**: Tracks `claudeSessionId` across turns for `claude --resume <id>`
- **Error Handling**: System error messages sent as `{type: "system", subtype: "error", content: "..."}`

## SSE Events Handled

### EventSource Connection
- **Endpoint**: `GET /api/events?token=<bearer_token>`
- **Authentication**: Token passed as query param (required for SSE, can't use headers)
- **Reconnection**: Browser auto-reconnects on disconnect

### Event Types (unnamed events, `onmessage` handler)
All events are unnamed and trigger `EventSource.onmessage`:
- **Session Status Updates**: Session started, stopped, renamed, deleted, metrics updated
- **Workspace Changes**: Workspace created, deleted, reordered, activated
- **Terminal Output**: (Optional async updates if PTY updates from external source)
- **Task Updates**: Task created, status changed, PR updated
- **System Notifications**: Server events, errors, warnings
- **Resource Updates**: CPU/memory spikes, disk alerts
- **Tunnel Status**: Tunnel started, stopped, status changed

## Complex/Unique Features

### 1. **Claude Session Integration**
- Auto-detection of Claude Code sessions from `~/.claude/projects/<encoded-cwd>/<uuid>.jsonl`
- Session resumption via `claude --resume <uuid>` (auto-backfilled from JSONL)
- Workspace documentation injection via `CWM_WORKSPACE_DOCS_PATH` and `CWM_DOCS_API_BASE` env vars
- Session-to-PTY mapping via store (survives server restart)

### 2. **AI-Powered Features**
- Auto-title generation: Analyzes session content to suggest titles
- Session summarization: Generates summary of session activity
- Task extraction: Parses session output to suggest tasks
- PR description generation: AI-generates PR description from code changes
- Conversation search: Full-text search with Claude AI ranking

### 3. **Worktree Task System**
- Automatic git worktree creation per task
- Branch name auto-generation from task name
- Task blocking/dependencies (task A blocks task B)
- PR workflow integration (create PR, track status)
- Merge/push/reject workflow for feature branches
- Multi-stage task lifecycle (todo → in_progress → completed/blocked)

### 4. **Cost Tracking & Analytics**
- Per-session token usage (input/output counts)
- Model-specific cost calculation
- Workspace-level aggregation
- Time-based filtering (day/week/month/all)
- Quota management (soft limits, usage alerts)
- Cross-workspace cost dashboard

### 5. **Dynamic UI State Management**
- Fallback UI (graceful degradation when server unavailable)
- Layout persistence (sidebar collapsed state, view mode, etc.)
- Session-aware context (current workspace, active session highlight)
- Responsive design with mobile support
- Theme system (12 themes)
- View mode persistence

### 6. **Spinoff Functionality**
- Extract tasks/context from one session
- Batch create multiple sessions from extracted context
- Preserve working directory and model settings
- Automatic context injection into new sessions

### 7. **Git Integration**
- Status checking (staged, modified, untracked)
- Worktree listing and lifecycle
- Branch tracking
- Automatic branch naming from task
- PR creation and status tracking
- Changes diffing

### 8. **Process Management**
- Kill specific PTY sessions
- Kill orphaned PTY processes
- System process listing with resource tracking
- Signal handling (SIGTERM, SIGKILL)

### 9. **Resource Monitoring**
- CPU usage per process and system total
- Memory usage tracking
- Disk space monitoring
- Uptime tracking
- Auto-refresh on tab visibility

### 10. **Mobile Bridge**
- Separate WebSocket endpoint for mobile Claude connections
- Stateless turn-based model (one claude process per message)
- Session resumption across turns
- JSON stream output format
- Model/directory overrides per connection

### 11. **Backup & Restore**
- Automatic snapshot of frontend files on startup
- Restore previous frontend version (fallback on UI break)
- Manifest-based restoration

### 12. **Rate Limiting & Security**
- Login rate limiting (5 attempts/60s per IP)
- Timing-safe password comparison
- Shell command sanitization (regex validation)
- Session ID validation
- Model name validation
- Directory path validation
- SHELL allowlist (prevents arbitrary binary execution)

### 13. **Multi-User Workspace**
- Workspace grouping and organization
- Session grouping within workspaces
- Shared documentation per workspace
- Feature assignment and tracking
- Conflict resolution UI

