# Myrlin iOS — Feature Inventory

Complete enumeration of all screens, features, REST APIs, WebSocket capabilities, and SSE events implemented in the Myrlin iOS app.

---

## Screens / Views

### Authentication & Root
- **LoginView** — Server URL + password input form. Calls `appState.login()` on form submission.
- **RootView** — Auth state gate. Shows LoginView if unauthenticated, MainView otherwise.
- **MainView** — Adaptive navigation root. iPad uses NavigationSplitView (sidebar + content + detail). iPhone uses NavigationStack with sequential navigation.

### Workspace Management
- **SidebarView** — Lists all workspaces. iPad: multi-select list. iPhone: NavigationStack root. Features: create workspace (+), refresh, group management, settings buttons. Right-click context menu: rename, activate, view docs, delete.
- **WorkspaceRow** — Single workspace display. Shows colored circle, name, session count, active star indicator.
- **WorkspaceDocsView** — Read-only documentation viewer for a workspace. Sections: Notes, Goals, Tasks (with toggles), Roadmap, Rules. All rendered as collapsible cards.
- **GroupManagementView** — Manage workspace groups. Create groups, rename, delete, move workspaces between groups, ungroup workspaces.

### Session Management
- **SessionListView** — Lists sessions for a workspace. iPad: multi-select list. iPhone: NavigationStack. Features: create session (+), refresh (↻), rename (context menu/swipe), restart, delete. Right-click context menu: rename, restart, delete. Swipe actions: delete, rename.
- **SessionRow** — Single session display. Status color dot, session name, status label, working directory.
- **SessionDetailView** — Sheet showing session metadata. Sections: name (editable inline), details (working dir, status, model, created, last active, Claude ID), tags, cost (load on demand), actions (restart, stop if running, delete). Cost section shows total/input/output tokens and estimated USD cost.
- **MobileSessionView** — Main session chat/terminal interface. Two modes:
  - **Chat Mode** — Stream-json messages with real-time rendering. Message list auto-scrolls. Shows connection status banner, generating indicator, stats bar. InputBar at bottom.
  - **Terminal Mode** — WKWebView wrapper. Loads web UI at `/#session/{sessionId}`. Injects auth token into localStorage.

### Message Rendering
- **MessageBubble** — Renders individual StreamMessage. Types:
  - Assistant text: left-aligned bubble with markdown + code blocks
  - User message: right-aligned blue bubble
  - Thinking: purple collapsible card
  - Tool use: indigo collapsible card with JSON input
  - Tool result: collapsible green/red card. Diffs colored (+green, -red, @@blue)
  - System init: CPU icon + model/tools/cwd
  - System message: center-aligned label (red for stderr, gray for others)
- **InputBar** — Multi-line text input (1-5 lines) with send button. Disabled when disconnected or generating.
- **StatsBar** — Displays input tokens (↓), output tokens (↑), cost ($). Formatted with abbreviations (k for thousands).

### Settings
- **SettingsView** — Server URL input, connection test button, appearance picker (system/light/dark), logout button.

---

## Features per Screen

### LoginView
- **Enter Server URL** — Text field with default "http://localhost:3456"
- **Enter Password** — SecureField
- **Connect** — POST /api/auth/login, stores token in Keychain
- **Error Display** — Shows connection errors in red
- **Progress Indicator** — Button shows spinner during login

### RootView / MainView
- **Adaptive Layout** — Auto-detect iPad (split view) vs iPhone (stack)
- **Session Selection** — Bind selected workspace and session across views
- **Navigation Binding** — iPad: sidebar triggers content pane update. iPhone: NavigationStack with .navigationDestination

### SidebarView
- **List Workspaces** — GET /api/workspaces on init. Refresh on pull-to-refresh or manual refresh button.
- **Create Workspace** — Sheet with name input. POST /api/workspaces, append to appState.workspaces
- **Rename Workspace** — Alert with text input. PATCH /api/workspaces/{id}
- **Delete Workspace** — Destructive action, DELETE /api/workspaces/{id}, remove from appState
- **Activate Workspace** — POST /api/workspaces/{id}/activate, update isActive flags
- **View Workspace Docs** — Navigate to WorkspaceDocsView in a sheet
- **Loading State** — Show ProgressView while workspacesLoaded = false
- **Error Overlay** — Red text banner at top

### SessionListView
- **List Sessions** — GET /api/sessions?workspaceId={workspace.id}. Filter appState.sessions by workspace.
- **Create Session** — Sheet with name input. POST /api/sessions, append to appState.sessions
- **Rename Session** — Alert with text input. PATCH /api/sessions/{id}
- **Delete Session** — Destructive action. DELETE /api/sessions/{id}
- **Restart Session** — POST /api/sessions/{id}/restart, then refresh
- **Pull-to-Refresh** — Manual refresh of sessions
- **Error Overlay** — Red text banner at top

### SessionDetailView
- **Edit Name** — Inline text field. PATCH /api/sessions/{id} when Save clicked
- **View Details** — Working dir (copy on tap), status badge, model, created date, last active date, Claude ID
- **View Tags** — Horizontal scroll list of tags
- **Load Cost** — GET /api/sessions/{id}/cost. Shows total/input/output tokens and estimated USD cost
- **Restart Session** — POST /api/sessions/{id}/restart, refresh sessions
- **Stop Session** — POST /api/sessions/{id}/stop (only if status=running), refresh sessions
- **Delete Session** — Confirmation dialog. DELETE /api/sessions/{id}, remove from appState, dismiss sheet

### MobileSessionView (Chat Mode)
- **Connect WebSocket** — On appear: call client.connect(sessionId, resumeSessionId, workingDir)
- **Display Messages** — ScrollView with LazyVStack of MessageBubbles. Auto-scroll to bottom on new messages.
- **Connection Status** — Banner shows "Connecting…" (connecting state) or error (red)
- **Generating Indicator** — Shows "Claude is thinking…" spinner while isGenerating = true
- **Stats Bar** — Rendered above InputBar if latest message is .stats type
- **Send Message** — InputBar calls client.send(text). Injected as local UserMessage. Set isGenerating = true.
- **Tab Switch** — Segmented picker switches between Chat / Terminal modes
- **Info Button** — Opens SessionDetailView sheet
- **Disconnect on Disappear** — Call client.disconnect()

### MobileSessionView (Terminal Mode)
- **Load Web Terminal** — WKWebView + inject token into localStorage.setItem('cwm_token'). Load URL: `baseURL/#session/sessionId`
- **Token Injection** — JavaScript at document start injects token and session ID into window scope

### MessageBubble
- **Assistant Text** — Rendered with MarkdownWithCodeBlocks. Can copy to clipboard.
- **User Message** — Blue right-aligned bubble. Can copy.
- **Thinking** — Purple collapsible card showing thinking content
- **Tool Use** — Indigo collapsible card. Shows tool name, icon, "subagent" badge if Task. Can expand to see JSON input.
- **Tool Result** — Green/red collapsible card. Auto-detects diffs and renders with colors. Can see error state.
- **System Init** — CPU icon, model name, tools count, working dir
- **System Message** — Center label. Red if stderr

### InputBar
- **Type Message** — Multi-line text field (1-5 lines). Disabled if disconnected or generating.
- **Send** — Arrow up button. Enabled only if text non-empty and connected. Calls onSend callback.
- **Clear After Send** — Text field cleared after sending

### SettingsView
- **Server URL** — Display and optional edit. Test connection button.
- **Test Connection** — GET /api/auth/check with token. Shows ✓ or ✗ result.
- **Appearance** — Picker: system/light/dark. Saved to AppStorage("appearanceMode")
- **Logout** — Destructive button. Confirmation alert. Calls appState.logout()

### WorkspaceDocsView
- **Load Docs** — GET /api/workspaces/{id}/docs on init
- **Display Sections** — Notes (markdown), Goals (bulleted list), Tasks (with toggle checkboxes), Roadmap (markdown), Rules (markdown)
- **Toggle Task** — POST /api/workspaces/{workspaceId}/docs/tasks/{index}/toggle. Optimistic update with reload on failure.
- **Refresh** — Pull-to-refresh reloads docs
- **Error Display** — Red error text with Retry button

### GroupManagementView
- **List Groups** — Display all groups from appState.groups
- **List Workspaces** — Grouped (under each group section) and ungrouped (Ungrouped section)
- **Create Group** — Sheet with group name. POST /api/groups
- **Rename Group** — Alert. PATCH /api/groups/{id}
- **Delete Group** — Destructive. DELETE /api/groups/{id}. Ungroups all workspaces in that group.
- **Add Workspace to Group** — Menu to pick workspace. PUT /api/workspaces/{wsId}/group
- **Remove from Group** — Update workspace groupId to nil. PATCH /api/workspaces/{id}

---

## REST API Endpoints Implemented

### Authentication
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/auth/login | Login with password. Returns token. |
| GET | /api/auth/check | Verify token validity. Returns {authenticated: bool} |

### Sessions
| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/sessions | List all sessions. Optional query: ?workspaceId={id} |
| POST | /api/sessions | Create session. Body: {name, workspaceId, workingDir?} |
| PATCH | /api/sessions/{id} | Update session. Body: {name?, tags?} |
| DELETE | /api/sessions/{id} | Delete session |
| POST | /api/sessions/{id}/start | Start session |
| POST | /api/sessions/{id}/stop | Stop session |
| POST | /api/sessions/{id}/restart | Restart session |
| GET | /api/sessions/{id}/cost | Fetch session cost. Returns {totalTokens?, inputTokens?, outputTokens?, estimatedCost?} |

### Workspaces
| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/workspaces | List all workspaces. Returns {workspaces: []} |
| POST | /api/workspaces | Create workspace. Body: {name, color?} |
| PATCH | /api/workspaces/{id} | Update workspace. Body: {name?, color?, description?} |
| DELETE | /api/workspaces/{id} | Delete workspace |
| POST | /api/workspaces/{id}/activate | Activate workspace (set as active) |
| GET | /api/workspaces/{id}/docs | Get workspace docs. Returns {docs: {notes?, goals?, tasks?, roadmap?, rules?}} |
| POST | /api/workspaces/{id}/docs/tasks/{index}/toggle | Toggle a task by positional index. Body: {index} |

### Workspace Groups
| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/groups | List all groups. Returns {groups: []} |
| POST | /api/groups | Create group. Body: {name, color?} |
| PATCH | /api/groups/{id} | Update group. Body: {name} |
| DELETE | /api/groups/{id} | Delete group |
| PUT | /api/workspaces/{workspaceId}/group | Add workspace to group. Body: {groupId} |

---

## WebSocket Features

### Connection (`/ws/mobile`)
- **URL Scheme** — `ws://` or `wss://` based on serverURL. IPv4 fallback for localhost.
- **Query Parameters**:
  - `token` — Bearer token (required)
  - `sessionId` — Myrlin session ID (required)
  - `resumeSessionId` — Claude session ID for resuming (optional)
  - `model` — Claude model override (optional)
  - `workingDir` — Working directory for session (optional)

### Message Flow
- **Client → Server (Input)** — JSON: `{type:"input", content:"user message"}`
- **Server → Client (Stream-JSON)** — Line-delimited JSON. Event types: `assistant`, `user`, `result`, `system`

### Capabilities
- **Connect** — Establish WebSocket. Auto-resolves localhost to 127.0.0.1 for IPv4.
- **Send** — `client.send(text)`. Serializes to JSON. Injects local user message. Sets isGenerating=true.
- **Receive** — Async loop receiving messages. Handles multiple messages per frame.
- **Turn Management** — Server sends `{type:"system", subtype:"turn_complete", claudeSessionId:"..."}` to signal end of turn. Client sets isGenerating=false and updates claudeSessionId.
- **Disconnect** — Close with code 1000 (goingAway).

### Message Types Received
- `assistant` — Content blocks (text, thinking, tool_use)
- `user` — Human message with tool_result blocks
- `result` — Usage stats (inputTokens, outputTokens, cost_usd)
- `system` — Control events (init, turn_complete) or messages

---

## SSE Events Handled

### Connection (`/api/events?token=...`)
- **Auto-Reconnect** — Exponential backoff (1s → 2s → 4s → ... up to 30s)
- **Format** — Server-Sent Events (text/event-stream). Data payload is JSON.

### Event Types
Handled in `AppState.handle(event:)`:

| Event Type | Payload Keys | Action |
|------------|--------------|--------|
| `session:created` | {session: Session} | Append to appState.sessions (dedupe by id) |
| `session:updated` | {session: Session} | Update session in appState.sessions |
| `session:deleted` | {sessionId: String} | Remove session from appState.sessions |
| `workspace:created` | {workspace: Workspace} | Append to appState.workspaces (dedupe by id) |
| `workspace:updated` | {workspace: Workspace} | Update workspace in appState.workspaces |
| `workspace:deleted` | {workspaceId: String} | Remove workspace from appState.workspaces |
| `workspace:activated` | {workspaceId: String} | Set isActive=true for that workspace, false for others |
| `workspaces:reordered` | {order: [String]} | Reorder workspaces by ID array |
| `group:created` | {group: WorkspaceGroup} | Append to appState.groups (dedupe by id) |
| `group:updated` | {group: WorkspaceGroup} | Update group in appState.groups |
| `group:deleted` | {groupId: String} | Remove group, ungroup all workspaces in that group |

### SSE Parsing Helper
- **parseSSEData()** — Extracts JSON from data lines, validates type field
- **Event Decoding** — StreamMessage.decodePayload<T>() handles ISO8601 dates with fallback formats

---

## Settings & Configuration

### AppStorage Keys (Persisted to UserDefaults)
| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `appearanceMode` | String | "system" | Appearance preference (system/light/dark). Set in MyrlinMobileApp and SettingsView. |

### Keychain Keys (Secure Storage via AuthService)
| Key | Purpose |
|-----|---------|
| `myrlin.serverURL` | Server base URL |
| `myrlin.authToken` | Bearer token from login |

### Session-Level Configuration
- **IPv4 Fallback** — MobileSessionClient replaces "localhost" with "127.0.0.1" for WebSocket (iOS resolution prefers IPv6)
- **Request Timeout** — 15s for most API calls, 5s for auth check
- **WebSocket Receive Loop** — Continuous async receive with connection state tracking
- **WKWebView Token Injection** — JavaScript injected at document start to populate localStorage and window scope

### Connection State Tracking
```swift
enum ConnectionState {
  case disconnected
  case connecting
  case connected
}
```

### Error Handling
- **API Errors** — tokenExpired (401) triggers auto-logout + NotificationCenter event
- **WebSocket Errors** — Connection failures set error state; manual disconnect clears isGenerating
- **SSE Auto-Reconnect** — Exponential backoff with max 30s delay
- **UI Error Display** — Red text banners in list views, error strings in session detail

---

## Data Models

### Session
```swift
struct Session: Codable, Identifiable {
  id: String
  name: String
  status: SessionStatus (running/stopped/error/unknown)
  workspaceId: String?
  workingDir: String?
  claudeSessionId: String?
  lastActive: Date?
  createdAt: Date?
  tags: [String]?
  model: String?
}

struct SessionCost {
  totalTokens: Int?
  inputTokens: Int?
  outputTokens: Int?
  estimatedCost: Double?
}
```

### Workspace
```swift
struct Workspace: Codable, Identifiable {
  id: String
  name: String
  color: String?  // hex color
  groupId: String?
  sessionCount: Int?
  isActive: Bool?
  description: String?
  createdAt: Date?
}

struct WorkspaceGroup: Codable, Identifiable {
  id: String
  name: String
  color: String?
  workspaceIds: [String]?
  workspaces: [Workspace] = []  // transient
}

struct WorkspaceDocs: Codable {
  notes: String?
  goals: [String]?
  tasks: [WorkspaceTask]?
  roadmap: String?
  rules: String?
}

struct WorkspaceTask: Identifiable, Codable {
  index: Int     // positional index for API
  text: String
  done: Bool
  var id: Int { index }
}
```

### Stream Messages
```swift
struct StreamMessage: Identifiable {
  id: UUID
  type: MessageType
  timestamp: Date

  enum MessageType {
    case assistantText(content: String)
    case thinking(content: String)
    case toolUse(name: String, toolUseId: String, inputJSON: String)
    case toolResult(content: String, toolUseId: String?, isError: Bool)
    case userMessage(content: String)
    case systemInit(model: String, tools: [String], cwd: String?)
    case systemMessage(content: String, subtype: String)
    case stats(inputTokens: Int, outputTokens: Int, cost: Double)
  }
}
```

---

## Summary Statistics

- **Total Swift Files**: 23
- **Screens**: 11 primary views + 1 WKWebView wrapper
- **REST Endpoints**: 18 implemented
- **SSE Event Types**: 9 handled
- **WebSocket URL Paths**: 1 (`/ws/mobile`)
- **AppStorage Keys**: 1 (appearanceMode)
- **Keychain Items**: 2 (serverURL, token)
- **Message Types**: 8 renderable types
- **Status States**: 4 (disconnected/connecting/connected/unknown)
- **Session Status**: 4 (running/stopped/error/unknown)

