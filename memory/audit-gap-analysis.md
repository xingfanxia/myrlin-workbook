# Myrlin iOS vs Web GUI — Gap Analysis
_Generated 2026-02-23_

Web GUI: 104 REST endpoints, 8 views, 13 complex features
iOS App: 18 REST endpoints, 11 screens, 8 message types

---

## ✅ Well Covered (iOS matches web)

| Feature | iOS Implementation |
|---------|-------------------|
| Login / auth / token | LoginView → POST /api/auth/login → Keychain |
| Workspace list + CRUD | SidebarView: create, rename, delete, activate |
| Session list + CRUD | SessionListView: create, rename, delete, start, stop, restart |
| Workspace groups | GroupManagementView: full CRUD + assign workspaces |
| Workspace docs (read + task toggle) | WorkspaceDocsView: notes/goals/tasks/roadmap/rules |
| Session detail sheet | SessionDetailView: metadata, cost, tags, model, actions |
| Chat mode (stream-json) | MobileSessionView: text, thinking, tool use, tool result, diffs, system init |
| Terminal mode (WKWebView) | TerminalWebView: full web PTY injected with token |
| SSE live updates | AppState: session/workspace/group created/updated/deleted events |
| Dark mode | preferredColorScheme from AppStorage, default: dark |
| Per-session cost | GET /api/sessions/{id}/cost |
| iPad split view + iPhone nav | MainView adaptive layout |

---

## ⚠️ Partially Covered (iOS has basic version, web has more)

| Feature | iOS Gap | Web Capability |
|---------|---------|----------------|
| **Docs editing** | Read-only + task toggle only | Full add/edit/delete per section (notes, goals, roadmap, rules); raw markdown editor |
| **Session create flags** | No flags at creation | Model override, bypass permissions, verbose, agent teams, custom command, working dir picker |
| **Cost analytics** | Per-session cost only | Cross-workspace dashboard, quota overview, period filter (day/week/month), token trends |
| **Workspace reorder** | No drag-and-drop | PUT /api/workspaces/reorder |
| **Session filtering** | No filter | Sidebar filter: all / running / stopped |
| **Themes** | system / light / dark only | 12 themes (Mocha, Nord, Dracula, Tokyo Night, etc.) |
| **Session tags** | Read-only display | Web can create/edit tags; iOS only shows them |

---

## ❌ Not Covered in iOS (web-only features)

### High Value — Likely Worth Adding

| Feature | Endpoints Needed | Effort |
|---------|-----------------|--------|
| **Session search** | GET /api/search, POST /api/search-conversations | Medium — search bar + results list |
| **AI auto-title** | POST /api/sessions/{id}/auto-title | Low — one button in SessionDetailView |
| **AI summarize** | POST /api/sessions/{id}/summarize | Low — one button, show result sheet |
| **Docs editing** | PUT /api/workspaces/{id}/docs, POST /api/workspaces/{id}/docs/{section}, PUT .../:{index}, DELETE .../:{index} | Medium — editable text fields per section |
| **Session flags on create** | Extend POST /api/sessions body | Low — add to create session sheet |
| **Cost dashboard** | GET /api/cost/dashboard, GET /api/quota-overview, GET /api/workspaces/{id}/cost, GET /api/stats | Medium — new CostView |
| **Subagent tracking display** | GET /api/sessions/{id}/subagents | Low — add to SessionDetailView |
| **Auth logout** | POST /api/auth/logout | Low — call on logout (currently only clears Keychain) |

### Medium Value — Nice to Have

| Feature | Endpoints Needed | Effort |
|---------|-----------------|--------|
| **Discover sessions** | GET /api/discover | Low — sheet listing auto-detected Claude sessions |
| **Spinoff session** | POST /api/sessions/{id}/spinoff-context | Low — action button in session |
| **Extract tasks** | POST /api/sessions/{id}/extract-tasks | Low — action button |
| **Export context** | GET /api/sessions/{id}/export-context | Low — share sheet |
| **Tunnel management** | GET/POST/DELETE /api/tunnels, /api/tunnel/named/* | Medium — new TunnelView |
| **File browser (dir picker)** | GET /api/browse | Medium — file tree for working dir picker |
| **Session model display** | GET /api/sessions/{id} | Low — already have model field in Session struct |
| **Refocus session** | POST /api/sessions/{id}/refocus | Low — action button |

### Low Value / Desktop-Only

| Feature | Reason to Skip |
|---------|---------------|
| **Worktree Tasks (Kanban board)** | Git worktree + PR workflow is desktop workflow; complex touch UX |
| **Resources View** | System monitoring (CPU/memory/processes) is server admin UI |
| **PTY image upload** | Desktop-specific |
| **Kill PTY / orphaned processes** | Server admin |
| **Git status/branches/worktrees** | Developer desktop workflow |
| **Layout persistence** | Web-specific (sidebar collapsed state, view mode) |
| **Backup & restore frontend** | Server admin |
| **12-theme system** | iOS system dark/light/tint is sufficient |
| **Spinoff batch** | Power user / desktop workflow |
| **PR description AI generation** | Tied to worktree task system |
| **Conflict resolution UI** | Desktop workflow |
| **Update check** | iOS has App Store |

---

## 📊 Coverage Summary

| Category | Web Endpoints | iOS Implemented | Coverage |
|----------|--------------|-----------------|---------|
| Auth | 3 | 2 (missing logout) | 67% |
| Sessions CRUD | 8 | 8 | 100% |
| Session AI/context | 8 | 0 | 0% |
| Session metrics | 4 | 1 (cost) | 25% |
| Workspaces | 7 | 6 (missing reorder) | 86% |
| Workspace docs | 9 | 2 (get + task toggle) | 22% |
| Workspace analytics | 3 | 0 | 0% |
| Groups | 5 | 5 | 100% |
| Templates | 3 | 0 | 0% |
| Features system | 5 | 0 | 0% |
| PTY management | 4 | 0 | 0% |
| Git integration | 5 | 0 | 0% |
| Worktree tasks | 15 | 0 | 0% |
| Tunnels | 7 | 0 | 0% |
| Search/Browse | 3 | 0 | 0% |
| Resources | 2 | 0 | 0% |
| Layout | 2 | 0 | 0% |
| Discovery/Version | 3 | 0 | 0% |

**Overall: 18 / 104 endpoints = 17% raw coverage, ~70% of daily-use features covered**

---

## Recommended Next Priorities (iOS-specific value)

1. **Auth logout** (POST /api/auth/logout) — 5 min fix
2. **Session create flags** (model, bypass perms, agent teams) — low effort, high utility
3. **AI auto-title + summarize buttons** in SessionDetailView — quick wins
4. **Workspace docs editing** — read-only feels incomplete
5. **Cost dashboard view** — power users want cost tracking on mobile
6. **Session search** — hard to find sessions in long lists without search
7. **Discover sessions** — onboarding flow for existing Claude users
