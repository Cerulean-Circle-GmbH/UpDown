[Back to Sprint 17 Planning](./planning.md)

# Task 158: Traceability Browser — Full-Data Chain Implementation
[task:uuid:d4e5f6a7-b8c9-0123-def4-158000000001]

**Blocked-by:** T159 (forward-only refactor) — DONE (58b17e3)
**Phase:** 22, B17 promoted

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement (this design)
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

---

## 1. STATIC_SHELL — /trace HTML Entry Point

The traceability browser is a static HTML shell served by the existing ONCE server. Pattern matches `multiplayer.html`:

### File: `qnd/src/public/trace.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UpDown — Traceability Browser</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="trace.css">
</head>
<body>
  <div id="trace-app"></div>
  <script type="module" src="dist/trace.js"></script>
</body>
</html>
```

### Bundle: `qnd/src/public/ts/trace.ts`
Entry point. Fetches `/api/trace/chain` JSON, instantiates `<trace-browser>`.

### Server Route
Add to server.ts route registration:
```typescript
// STATIC_SHELL for /trace
app.get('/trace', (req, res) => res.sendFile('trace.html'));
app.get('/api/trace/chain', (req, res) => res.json(buildForwardChain()));
```

### esbuild Config
Add `trace.ts` to esbuild entry points alongside `multiplayer.ts`.

---

## 2. Forward-Only Data Shape (T159 compliant)

### Chain: Req → Task → {Subtask ∪ UseCase} → Class → Method

```typescript
interface TraceChain {
  requirements: RequirementNode[];
}

interface RequirementNode {
  type: 'requirement';
  uuid: string;
  name: string;            // "R1"
  altId: string;           // "UC-R2"
  description: string;
  status: 'unchecked' | 'partial' | 'covered';
  forwardTo: {
    tasks: TaskNode[];
  };
}

interface TaskNode {
  type: 'task';
  uuid: string;
  name: string;
  status: 'Planned' | 'In Progress' | 'QA Review' | 'Done';
  sprint: string;
  forwardTo: {
    subtasks: SubtaskNode[];
    useCases: UseCaseNode[];
    changes: string[];       // file paths
  };
}

interface SubtaskNode {
  type: 'subtask';
  uuid: string;
  name: string;
  role: string;            // "expert", "tester", "architect"
  status: string;
}

interface UseCaseNode {
  type: 'usecase';
  uuid: string;            // 8-char: "fbfed148"
  name: string;            // "UC-R2"
  object: string;          // "room"
  verb: string;            // "create"
  source: string;          // "qnd-usecase-diagram.puml:L42"
  coverage: 'covered' | 'partial' | 'missing';
  tests: TestNode[];       // evidence (inline, not a chain level)
  forwardTo: {
    classes: ClassNode[];
  };
}

interface ClassNode {
  type: 'class';
  uuid: string;
  name: string;            // "GameRoom"
  source: string;          // "qnd/src/server/GameRoom.ts"
  commit: string;          // short SHA
  commitDate: string;
  lineCount: number;
  unit?: string;           // .ts.unit path
  m3Unit?: string;         // MDAv4/M3/CLASS/ path
  forwardTo: {
    methods: MethodNode[];
  };
}

interface MethodNode {
  type: 'method';
  name: string;            // "addPlayer"
  signature: string;
  source: string;          // "GameRoom.ts:103"
  commit: string;
  lines: { start: number; end: number };
  // LEAF — no forwardTo
}

interface TestNode {
  type: 'test';
  name: string;            // "uc-r2-room-create.test.ts"
  ucUuid: string;
  aceCount: number;
  passCount: number;
  source: string;
}
```

---

## 3. Typed DetailViews (Lit Web Components)

One DetailView per chain node type. Each renders ONLY forward data.

### 3.1 `<requirement-detail-view>`
```
┌─────────────────────────────────────────┐
│ R2: HTTPSServer in @web4x/http          │
│ [requirement:uuid:...002]               │
│ Status: ● covered                       │
│                                         │
│ HTTPSServer must be available in        │
│ @web4x/http with TLS dependency         │
│                                         │
│ ── Forward: Tasks (2) ──               │
│ → Task 1: Boundary File Extraction      │
│ → Task 3: ONCE Server Start Parity      │
└─────────────────────────────────────────┘
```

### 3.2 `<task-detail-view>`
```
┌─────────────────────────────────────────┐
│ Task 1: Boundary File Extraction        │
│ Sprint: Sprint 1 | Status: ✅ Done      │
│                                         │
│ ── Forward: Subtasks (3) ──            │
│ → 1.1 Expert: HTTPSServer extraction    │
│ → 1.2 Expert: StaticFileRoute           │
│ → 1.3 Expert: ACMEChallengeRoute        │
│                                         │
│ ── Forward: Use Cases (2) ──           │
│ → UC-C1: connection.open                │
│ → UC-R2: room.create                    │
│                                         │
│ ── Forward: Files Changed (3) ──       │
│ → HTTP/0.3.23.1/.../HTTPSServer.ts      │
│ → HTTP/0.3.23.1/package.json            │
│ → TLS/0.3.23.1/.../ACMEChallenge...     │
└─────────────────────────────────────────┘
```

### 3.3 `<usecase-detail-view>`
```
┌─────────────────────────────────────────┐
│ UC-R2: room.create                      │
│ UUID: fbfed148 | Coverage: ● covered    │
│ Object: room | Verb: create             │
│ Source: qnd-usecase-diagram.puml:L42    │
│                                         │
│ ── Tests (evidence) ──                 │
│ ✅ uc-r2-room-create.test.ts (7/7 AC)  │
│ ✅ protocol-test-suite.js TC2.3         │
│                                         │
│ ── Forward: Classes (3) ──             │
│ → WebSocketClient                       │
│ → RoomManager                           │
│ → GameRoom                              │
└─────────────────────────────────────────┘
```

### 3.4 `<class-detail-view>`
```
┌─────────────────────────────────────────┐
│ GameRoom                                │
│ qnd/src/server/GameRoom.ts              │
│ commit: 7e8d4f2 (2026-05-14) | 600 ln  │
│ Unit: GameRoom.ts.unit                  │
│ M3: MDAv4/M3/CLASS/GameRoom.unit        │
│                                         │
│ ── Forward: Methods (7) ──             │
│ → addPlayer(id, ws, name, avatar) :103  │
│ → removePlayer(clientId) :254           │
│ → startGame() :290                      │
│ → nextRound() :315                      │
│ → playCard(playerId, guess) :411        │
│ → resolveRound() :428                   │
│ → endGame() :528                        │
└─────────────────────────────────────────┘
```

### 3.5 `<method-detail-view>`
```
┌─────────────────────────────────────────┐
│ GameRoom.addPlayer()                    │
│ :103-128 (26 lines)                     │
│ commit: 7e8d4f2 (2026-05-14)           │
│                                         │
│ addPlayer(id: string, ws: WebSocket,    │
│   name: string, avatar?: string): void  │
│                                         │
│ (LEAF — end of forward chain)           │
└─────────────────────────────────────────┘
```

### 3.6 `<test-detail-view>` (inline under UseCase)
```
┌─────────────────────────────────────────┐
│ uc-r2-room-create.test.ts               │
│ Acceptance: 7/7 ✅                      │
│ Source: qnd/test/vitest/uc-r2-...       │
└─────────────────────────────────────────┘
```

### 3.7 `<subtask-detail-view>`
```
┌─────────────────────────────────────────┐
│ Task 1.1: Expert — HTTPSServer          │
│ Role: expert | Status: ✅ Done          │
└─────────────────────────────────────────┘
```

---

## 4. Tree-Item Rendering for 7 Chain Types

### `<trace-tree-item>` — polymorphic tree node

Each tree item renders based on `node.type`:

```typescript
@customElement('trace-tree-item')
class TraceTreeItem extends LitElement {
  @property() node: TraceNode;
  @property({ type: Number }) depth: number = 0;
  @property({ type: Boolean }) expanded: boolean = false;

  render() {
    return html`
      <div class="tree-item depth-${this.depth}" @click=${this.toggle}>
        ${this.expanded ? '▾' : '▸'}
        ${this.renderIcon()}
        ${this.renderLabel()}
        ${this.renderBadge()}
      </div>
      ${this.expanded ? this.renderChildren() : nothing}
    `;
  }
}
```

### Icon + Label per type:
| Type | Icon | Label | Badge |
|------|------|-------|-------|
| requirement | 📋 | `${name}: ${description.slice(0,40)}` | status pill |
| task | 📝 | `${name}` | sprint + status |
| subtask | 🔧 | `${name}` | role tag |
| usecase | 🎯 | `${name}: ${object}.${verb}` | coverage pill |
| class | 📦 | `${name}` | commit short SHA |
| method | ⚙️ | `${name}() :${lines.start}` | line count |
| test | ✅/❌ | `${name}` | `${passCount}/${aceCount}` |

### Depth indentation
CSS `padding-left: calc(depth * 1.5rem)`. Max depth 6 (Req→Task→Subtask→UC→Class→Method).

---

## 5. VerbRegistry Wiring

UseCase `object.verb` maps to VerbRegistry for consistent categorization:

```typescript
const VERB_REGISTRY: Record<string, string[]> = {
  'connection': ['open', 'close', 'reconnect'],
  'room':       ['create', 'join', 'leave', 'list'],
  'game':       ['start', 'end'],
  'player':     ['guess', 'score', 'streak', 'timeout'],
  'round':      ['start', 'countdown', 'resolve'],
  'bot':        ['add', 'decide'],
  'chat':       ['send', 'history'],
  'host':       ['transfer'],
  'spectator':  ['join'],
};
```

Filter dropdown populated from VerbRegistry keys. Selecting "room" shows all UCs where `object === 'room'`.

---

## 6. Data Source → Chain Builder

### `buildForwardChain(): TraceChain`

Server-side function that:
1. Reads `scrum.pmo/sprints/*/requirements.md` → parse RequirementNodes
2. For each requirement, reads linked `task-*.md` files → parse TaskNodes
3. For each task, reads `forwardTo.useCases` from traceability-matrix.md → parse UseCaseNodes
4. For each UC, reads `Impl File:Method` column → parse ClassNodes + MethodNodes
5. For each UC, reads `Test File:Line` column → parse TestNodes
6. Returns complete `TraceChain` JSON

### Caching
Server caches chain JSON. Invalidated on file change (fs.watch on scrum.pmo/ + qnd/spec/).

---

## 7. File Manifest

| File | Purpose | Bundle? |
|------|---------|---------|
| `qnd/src/public/trace.html` | STATIC_SHELL entry point | — |
| `qnd/src/public/trace.css` | Trace browser styles | — |
| `qnd/src/public/ts/trace.ts` | Entry: fetch chain, mount `<trace-browser>` | esbuild → dist/trace.js |
| `qnd/src/public/ts/TraceBrowser.ts` | Main container: tree nav + detail panel | bundled |
| `qnd/src/public/ts/TraceTreeItem.ts` | Polymorphic tree node (7 types) | bundled |
| `qnd/src/public/ts/views/RequirementDetailView.ts` | DetailView for Requirement | bundled |
| `qnd/src/public/ts/views/TaskDetailView.ts` | DetailView for Task | bundled |
| `qnd/src/public/ts/views/SubtaskDetailView.ts` | DetailView for Subtask | bundled |
| `qnd/src/public/ts/views/UseCaseDetailView.ts` | DetailView for UseCase + Tests | bundled |
| `qnd/src/public/ts/views/ClassDetailView.ts` | DetailView for Class | bundled |
| `qnd/src/public/ts/views/MethodDetailView.ts` | DetailView for Method (LEAF) | bundled |
| `qnd/src/public/ts/views/TestDetailView.ts` | Inline test evidence | bundled |
| `qnd/src/public/ts/VerbRegistry.ts` | UC object.verb categorization | bundled |
| `qnd/src/public/ts/TraceChainTypes.ts` | TypeScript interfaces (§2 above) | bundled |
| `qnd/src/ts/server/traceChainBuilder.ts` | Server: parse markdown → JSON | server bundle |

**Rule (a)+(b)+(c):** STATIC_SHELL required. `trace.html` is the shell. `dist/trace.js` is the esbuild bundle. Server route serves both.

---

## Acceptance Criteria (from T158 + planner)
- [ ] AC-1: `/trace` serves trace.html STATIC_SHELL
- [ ] AC-2: `/api/trace/chain` returns forward-only JSON matching TraceChain interface
- [ ] AC-3: `<trace-browser>` renders tree nav + detail panel
- [ ] AC-4: `<trace-tree-item>` renders all 7 chain types with correct icon/label/badge
- [ ] AC-5: `<requirement-detail-view>` shows name, altId, description, forwardTo.tasks[]
- [ ] AC-6: `<task-detail-view>` shows subtasks, useCases, changes — NO links.up
- [ ] AC-7: `<usecase-detail-view>` shows object.verb, coverage, tests, forwardTo.classes[]
- [ ] AC-8: `<class-detail-view>` shows source, commit, lines, unit, forwardTo.methods[]
- [ ] AC-9: `<method-detail-view>` shows signature, source:line, commit — LEAF
- [ ] AC-10: `<test-detail-view>` shows aceCount/passCount inline under UseCase
- [ ] AC-11: Tree depth controls (1/2/3/∞) work
- [ ] AC-12: Filter by class name filters forward chain
- [ ] AC-13: VerbRegistry powers UC category filter dropdown

---

**Architect:** web4-architect (forked from web4-po) @ web4team:0.0
**Sprint:** Sprint 17 — Scenario Units
**Depends on:** T159 (DONE — 58b17e3)
