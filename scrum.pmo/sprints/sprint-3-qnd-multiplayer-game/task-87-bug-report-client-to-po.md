[Back to Sprint 3 Planning](./planning.md)

# Task 87: Bug Report Button — Client That Sends Prompts to ud-po

## Status
- [x] Planned
- [x] Architect Analysis
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Tron Requirement

The 4th link under the version click on / is "Bug Report" — currently a placeholder.

### Architecture
- ud-po (this agent) is remote-controlled via Claude Code app
- The bug report button opens an input field in the browser
- User types a bug description
- The input is sent to ud-po as a prompt (via WebSocket → server → Claude Code API or otmux)
- ud-po receives it and can act on it (create task file, assign to team)

### Pairing
- A "Pair" button connects the browser client to THIS specific ud-po instance
- Pairing means: this browser's bug reports go to ud-po at upDownTeam:0.0
- Pairing could use: session ID, WebSocket channel, or otmux send target

## Flow
```
User clicks "🐛 Bug Report" on any page
  → Input field appears: "Describe the bug..."
  → User types description, clicks Submit
  → Client sends via WebSocket: { type: 'BUG_REPORT', text: '...' }
  → Server receives, forwards to ud-po via:
     Option A: otmux send upDownTeam:0.0 "BUG REPORT from user: {text}" Enter
     Option B: Claude Code API call
     Option C: Write to a bug-reports.json file that ud-po monitors
  → ud-po receives prompt, creates task file, assigns team
```

## Pairing Flow
```
ud-po clicks "Pair" in browser OR runs a pairing command
  → Server generates pairing token
  → ud-po's pane target (upDownTeam:0.0) stored as bug report destination
  → All future bug reports from paired browsers route to this pane
```

## Architect Analysis (2026-05-14)

### 1. Forwarding Mechanism — RECOMMEND: Option A (otmux send)

| Option | How | Pros | Cons |
|--------|-----|------|------|
| **A: otmux send** | Server runs `exec('otmux send upDownTeam:0.0 "text" Enter')` | Simplest. Works NOW. PO is in Remote Control mode — text goes directly into Claude Code prompt. No API keys needed. | Requires tmux on server host. Shell injection risk (must sanitize). |
| B: Claude Code API | Server calls Anthropic API with bug report as user message | Clean API. No tmux dependency. | Needs API key management. Creates NEW conversation, not the running PO session. Can't interact with the existing agent's context. |
| C: File monitor | Server writes to `data/bug-reports.json`, PO polls with `/loop` | No shell exec. Decoupled. | PO must actively poll. Latency (polling interval). More complex than otmux send. |

**Option A wins** because:
- ud-po is ALREADY running in a tmux pane with Remote Control active
- `otmux send upDownTeam:0.0 "text" Enter` delivers text directly to the Claude Code prompt input
- Server already uses `exec()` (line 14, 462) — no new capability needed
- Zero latency — prompt appears immediately
- PO's full context is available (team layout, task files, sprint planning)

### 2. Pairing Mechanism

**Problem:** How does the server know WHICH tmux pane is the PO?

**Solution: Server config file.** Store the pairing in `data/agent-pairing.json`:

```json
{
  "bugReportTarget": "upDownTeam:0.0",
  "pairedAt": "2026-05-14T20:00:00Z",
  "pairedBy": "Tron"
}
```

**How to pair:**
- Option 1: **Admin API** — `POST /api/pair-bug-report { pane: "upDownTeam:0.0" }` (from TUI or curl)
- Option 2: **WS message** — admin sends `{ type: 'PAIR_BUG_REPORT', pane: 'upDownTeam:0.0' }` from browser
- Option 3: **Hardcode** — set in server.ts config. Change requires restart.
- Option 4: **Auto-detect** — server runs `otmux pane.get.target` to find its own session, assumes PO is at :0.0

**Recommend Option 2** (WS message) for flexibility + Option 3 (hardcode default) as fallback:

```typescript
// server.ts config
let bugReportTarget = 'upDownTeam:0.0'; // default

// WS handler
case 'PAIR_BUG_REPORT': {
  if (msg.pane && typeof msg.pane === 'string') {
    bugReportTarget = msg.pane;
    savePairing(bugReportTarget);
    send({ type: 'PAIR_OK', target: bugReportTarget });
  }
  break;
}
```

### 3. Security — Input Sanitization

**Threat:** Bug report text injected into `otmux send` shell command could execute arbitrary commands.

Example attack: User submits `"; rm -rf / #` → `otmux send pane "; rm -rf / #" Enter`

**Three layers of defense:**

**Layer 1: Text sanitization (server-side)**
```typescript
function sanitizeBugReport(text: string): string {
  return text
    .slice(0, 500)                    // max 500 chars
    .replace(/[`$\\'";\n\r]/g, '')    // strip shell metacharacters
    .replace(/[^\x20-\x7E]/g, '')     // ASCII printable only
    .trim();
}
```

**Layer 2: Use array form of exec (no shell interpolation)**
```typescript
import { execFile } from 'node:child_process';
// execFile doesn't use shell — no injection possible
execFile('otmux', ['send', bugReportTarget, `[@browser-user] BUG REPORT: ${sanitized}`, 'Enter']);
```
`execFile` with argument array is immune to shell injection — arguments are passed directly to the process, not through a shell.

**Layer 3: Prefix tag**
All bug reports prefixed with `[@browser-user] BUG REPORT:` so the PO knows the source. The PO can choose to ignore, triage, or act. The text is a PROMPT, not a command — the PO agent decides what to do with it.

### 4. How ud-po Receives the Prompt

The PO's Claude Code session is in **Remote Control** mode (verified: `otmux pane.capture upDownTeam:0.0` shows "Remote Control active"). In this mode:

1. `otmux send upDownTeam:0.0 "text" Enter` types "text" into the Claude Code prompt and presses Enter
2. Claude Code processes it as a user message
3. The PO agent responds in its conversation context (has access to team, tasks, sprint planning)
4. PO can create task files, delegate to expert/tester, or respond

**If PO is NOT in Remote Control:** The text goes to the tmux pane's shell, not to Claude Code. This is harmless (shell ignores non-commands) but the bug report is lost. The pairing mechanism should verify the target pane has an active Claude Code session.

**Verification command:** Before sending, server can check:
```typescript
const check = await execAsync(`otmux pane.capture ${bugReportTarget} 2 2>/dev/null`);
if (!check.stdout.includes('Remote Control')) {
  // PO not available — queue the report to file instead
  queueBugReport(sanitized);
}
```

### 5. Existing WebSocket Server — Reuse

No separate channel needed. The game's existing WebSocket handles BUG_REPORT as another message type:

```typescript
case MSG.BUG_REPORT: {
  const text = sanitizeBugReport(msg.text || '');
  if (!text) { send({ type: MSG.ERROR, message: 'Empty bug report' }); break; }
  
  const playerName = [...wsClients].find(c => c.id === clientId)?.name || 'Anonymous';
  const prompt = `[@browser-user ${playerName}] BUG REPORT: ${text}`;
  
  try {
    await execFileAsync('otmux', ['send', bugReportTarget, prompt, 'Enter']);
    send({ type: 'BUG_REPORT_OK' });
    addLog(`🐛 Bug report from ${playerName}: ${text.slice(0, 50)}...`);
  } catch {
    // Fallback: write to file
    appendBugReport(playerName, text);
    send({ type: 'BUG_REPORT_OK' }); // still ACK to user
  }
  break;
}
```

### 6. Files to Modify

| File | Change | Lines |
|------|--------|-------|
| server.ts | BUG_REPORT handler + sanitize + execFile to otmux | ~30 |
| server.ts | PAIR_BUG_REPORT handler + config persistence | ~15 |
| server.ts | Fallback: appendBugReport to data/bug-reports.json | ~10 |
| MessageTypes.ts | Add BUG_REPORT, BUG_REPORT_OK, PAIR_BUG_REPORT, PAIR_OK | ~4 |
| Client (all pages) | Bug report button + input field + submit handler | ~40 |
| WebSocketClient.ts | sendBugReport(text) method | ~3 |
| **Total** | | **~100** |

### 7. Architecture Diagram

```
Browser                    Server (Node.js)              tmux
┌─────────────┐           ┌──────────────────┐          ┌────────────────┐
│ 🐛 Bug Report│  WS msg  │ BUG_REPORT       │ execFile │ upDownTeam:0.0 │
│ [text input] │ ───────→ │ sanitize(text)   │ ───────→ │ ud-po (Claude) │
│ [Submit]     │          │ execFile(otmux,  │          │ Remote Control │
│              │  WS ack  │  send, pane, txt)│          │ → processes as │
│ "Report sent"│ ←─────── │ BUG_REPORT_OK    │          │   user prompt  │
└─────────────┘           └──────────────────┘          └────────────────┘
                                    │ fallback
                                    ▼
                          data/bug-reports.json
                          (if otmux send fails)
```

### Architect Review
- [x] otmux send is the right mechanism — direct prompt delivery, zero latency
- [x] execFile (not exec) prevents shell injection
- [x] Text sanitization strips metacharacters + 500 char limit
- [x] Fallback to file if PO pane unavailable
- [x] Reuses existing WebSocket — no new server/channel needed
- [x] Pairing via WS message + hardcode default

## Acceptance Criteria
- [ ] Bug Report button on all 4 pages (under version click)
- [ ] Opens input field for bug description
- [ ] Submit sends report to ud-po
- [ ] ud-po receives report as a prompt in its Claude Code session
- [ ] Pair button connects browser to specific ud-po instance
- [ ] Bug report text is sanitized (no injection)
- [ ] Vitest passes
