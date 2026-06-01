[Back to Sprint 3 Planning](./planning.md)

# T158: Traceability Browser — Full-Data Chain Design

## Goal
Design a browser-based traceability explorer that surfaces the complete **forward-only** chain from requirement to implementation. Navigation flows strictly downward — requirements point to tasks, tasks to use cases and subtasks, use cases to classes, classes to methods. No back-references.

## TRON Directive (Refinement)
> Traceability is FORWARD-ONLY from requirement. Chain: Requirement → Task → {subtasks AND use cases} → Class → Method. NO back-references from Task to Requirement, from UC to Requirement, etc. Many Requirements can point forward to same Task (forward-only fan-in).

## Data Model

Forward-only directed graph. Each node points DOWN only:

```
Requirement ──→ Task ──→ Subtask
                  │──→ UseCase ──→ Class ──→ Method
```

Multiple Requirements can fan-in to the same Task (many-to-one forward).
No entity has an "up" link. Navigation is always root→leaf.

### Entity: Requirement (ROOT — entry point)
```typescript
interface RequirementView {
  uuid: string;            // [requirement:uuid:...]
  name: string;            // "R1", "R2", etc.
  altId: string;           // short form: "UC-R2", "UC-G1"
  description: string;     // full text
  forwardTo: {
    tasks: TaskLink[];     // forward: tasks implementing this req
  };
  status: 'unchecked' | 'partial' | 'covered';
}
```

### Entity: Task (forward from Requirement)
```typescript
interface TaskView {
  uuid: string;            // [task:uuid:...]
  name: string;            // "Task 1: WebSocket Game Rooms"
  status: 'Planned' | 'In Progress' | 'QA Review' | 'Done';
  sprint: string;
  forwardTo: {
    subtasks: SubtaskLink[];   // forward: child subtasks
    useCases: UCLink[];        // forward: use cases this task covers
    changes: FileLink[];       // forward: files modified
  };
  // NO links.up — Tasks do NOT point back to Requirements
  // Requirements point forward TO tasks (fan-in: many reqs → one task)
}
```

### Entity: UseCase (forward from Task)
```typescript
interface UseCaseView {
  uuid: string;            // 8-char short: "92a061e0"
  name: string;            // "UC-C1"
  object: string;          // "connection"
  verb: string;            // "open"
  source: string;          // qnd-usecase-diagram.puml + line
  coverage: 'covered' | 'partial' | 'missing';
  forwardTo: {
    classes: ClassLink[];  // forward: implementation classes
  };
  // NO back-ref to tasks or requirements
  // Tasks point forward TO use cases
}
```

### Entity: Class (forward from UseCase)
```typescript
interface ClassView {
  uuid: string;            // from .ts.unit or M3 CLASS unit
  name: string;            // "GameRoom"
  source: string;          // "qnd/src/server/GameRoom.ts"
  commit: string;          // last git commit hash
  lines: { start: number; end: number };
  unit?: string;           // path to .ts.unit file
  m3Unit?: string;         // path to MDAv4/M3/CLASS/{name}.unit
  forwardTo: {
    methods: MethodView[]; // forward: methods in this class
  };
  // NO back-ref to use cases
  // UseCases point forward TO classes
}
```

### Entity: Method (LEAF — forward from Class)
```typescript
interface MethodView {
  name: string;            // "addPlayer"
  signature: string;       // "addPlayer(id: string, ws: WebSocket, name: string): void"
  source: string;          // "GameRoom.ts:103"
  commit: string;          // last commit touching this method
  lines: { start: number; end: number };
  // Method is the leaf of the chain. No forward links.
  // Tests are evidence — attached at the UseCase level, not method.
}
```

### Entity: Test
```typescript
interface TestView {
  name: string;            // "uc-c1-connection-open.test.ts"
  ucUuid: string;          // "92a061e0" — use case under test
  aceCount: number;        // acceptance criteria count
  passCount: number;       // passing criteria
  source: string;          // file path
  methods: MethodLink[];   // methods exercised
}
```

## Browser Layout (Forward-Only Tree)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔍 Filter: [class name ▼] [uc category ▼] [status ▼] [search...] │
├──────────────┬───────────────────────────────────────────────────────┤
│              │                                                       │
│  FORWARD     │  DETAIL PANEL (selected node)                        │
│  TREE        │                                                       │
│              │  ┌─────────────────────────────────────────────┐     │
│  ▸ R1: ident│  │ R2: HTTPSServer in @web4x/http              │     │
│    → T1: Bnd│  │ [requirement:uuid:...100000000002]           │     │
│      → T1.1 │  │ Status: covered                              │     │
│      → T1.2 │  │                                              │     │
│    → T3: Srv│  │ ── Forward: Tasks ──                         │     │
│ ►▸ R2: HTTP◄│  │ → Task 1: Boundary File Extraction (Done)   │     │
│    → T1: Bnd│  │   → Subtask 1.1: HTTPSServer extraction     │     │
│      → UC-C1│  │   → Subtask 1.2: StaticFileRoute extraction │     │
│        → WSC│  │ → Task 3: ONCE Server Start Parity (Done)   │     │
│        → Srv│  │                                              │     │
│      → UC-R2│  │ ── Forward: Use Cases (via Tasks) ──        │     │
│       → Game│  │ → UC-C1: connection.open                    │     │
│        .addP│  │ → UC-R2: room.create                        │     │
│        .star│  │                                              │     │
│  ▸ R3: srvr │  └─────────────────────────────────────────────┘     │
│  ▸ R4: CLI  │                                                       │
│  ...        │  Tree always rooted at Requirements.                  │
│              │  Every expansion goes deeper. Never up.              │
│              │                                                       │
├──────────────┴───────────────────────────────────────────────────────┤
│  Depth: [1] [2] [3] [∞]  │  Chain types: Req→Task→UC→Class→Method │
└──────────────────────────────────────────────────────────────────────┘
```

### 7 Chain Node Types in Tree
1. **Requirement** (root) — name, altId, description, status
2. **Task** — name, sprint, status
3. **Subtask** — name, role, status
4. **UseCase** — object.verb, uuid, coverage
5. **Class** — name, source file, commit
6. **Method** — name, source:line, commit
7. **Test** — name, aceCount, passCount (leaf evidence, shown inline under UC)

## Navigation Rules

### Forward-Only
Navigation flows strictly downward from Requirements. No back-links.
```
Requirement
  └→ Task
      ├→ Subtask (role-specific)
      └→ UseCase (object.verb)
          └→ Class (source file)
              └→ Method (implementation)
```

Clicking a forward link drills deeper into the chain. The tree always expands downward.
To see "which requirements lead to this task," you search requirements — not click up from task.

### Fan-In (Many-to-One Forward)
Multiple Requirements can point forward to the same Task. The browser shows this as:
- R1 → Task 1
- R2 → Task 1
- R3 → Task 2

Task 1 appears under both R1 and R2 in the tree. But Task 1 itself has no "parent" field.

### Tree Depth Controls
- **Depth 1:** Entity names only (flat list)
- **Depth 2:** Entity + direct children (UC → Classes)
- **Depth 3:** Full chain (UC → Classes → Methods → Tests)
- **Depth ∞:** Complete expansion

### Filters
- **By Class:** Show only UCs/Tests/Methods for a specific class (e.g., "GameRoom")
- **By UC Category:** Filter by object prefix (connection.*, rooms.*, game.*, player.*, bot.*, chat.*)
- **By Status:** covered / partial / missing
- **By Sprint:** Show only entities from specific sprint
- **Search:** Full-text across all entity names, descriptions, file paths

## Detail Panel Content Per Entity Type

### Requirement Selected (ROOT — drill down from here)
```
R2: HTTP server start identical to 0.3.22.1
[requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000002]
Description: HTTPSServer must be available in @web4x/http with TLS dependency

── Forward: Tasks ──
→ Task 1: Boundary File Extraction (Sprint 1, Done)
  → Subtask 1.1: Expert — HTTPSServer extraction
  → Subtask 1.2: Expert — StaticFileRoute extraction
→ Task 3: ONCE Server Start Parity (Sprint 1, Done)

── Forward: Use Cases (via Tasks) ──
→ UC-C1: connection.open
→ UC-R2: room.create
```

### Task Selected (forward-only — shows children, NOT parents)
```
Task 1: Boundary File Extraction
[task:uuid:b1c2d3e4-f5a6-7890-bcde-200000000001]
Status: Done | Sprint: Sprint 1

── Forward: Subtasks ──
→ Task 1.1: Expert — HTTPSServer extraction
→ Task 1.2: Expert — StaticFileRoute extraction
→ Task 1.3: Expert — ACMEChallengeRoute extraction

── Forward: Use Cases ──
→ UC-C1: connection.open
→ UC-R2: room.create

── Forward: Files Changed ──
→ HTTP/0.3.23.1/src/ts/layer2/HTTPSServer.ts (added)
→ HTTP/0.3.23.1/package.json (@web4x/tls dep added)
→ TLS/0.3.23.1/src/ts/layer2/ACMEChallengeRoute.ts (added)

(NO links.up — to find which Requirements led here, search Requirements)
```

### UseCase Selected (forward-only — shows classes, NOT tasks/requirements)
```
UC-R2: room.create
UUID: fbfed148 | Object: room | Verb: create
Source: qnd/spec/qnd-usecase-diagram.puml:L42

── Forward: Classes ──
→ WebSocketClient [qnd/src/client/WebSocketClient.ts]
→ RoomManager [qnd/src/server/RoomManager.ts]
→ GameRoom [qnd/src/server/GameRoom.ts]

(NO back-ref to Tasks or Requirements)
```

### Class Selected (forward-only — shows methods)
```
GameRoom [qnd/src/server/GameRoom.ts]
Lines: 1-600 | commit: 7e8d4f2 (2026-05-14)
Unit: qnd/src/server/GameRoom.ts.unit
M3: MDAv4/M3/CLASS/GameRoom.unit

── Forward: Methods ──
  addPlayer(id, ws, name, avatar) :103-128
  removePlayer(clientId) :254-276
  startGame() :290-310
  nextRound() :315-365
  playCard(playerId, guess) :411-425
  resolveRound() :428-527
  endGame() :528-550

(NO back-ref to Use Cases — to find which UCs lead here, search UCs)
```

### Method Selected (LEAF — no forward links)
```
GameRoom.addPlayer(id, ws, name, avatar) :103-128
commit: 7e8d4f2 (2026-05-14) | 26 lines

Source: qnd/src/server/GameRoom.ts:103
Signature: addPlayer(id: string, ws: WebSocket, name: string, avatar?: string): void

(LEAF node — end of forward chain. No further navigation.)
(To find which UCs/Tests exercise this method, traverse from Requirements → ... → Class → this Method)
```

## Data Source Integration

### Where data comes from
| Data | Source | Parse method |
|------|--------|-------------|
| Requirements | `scrum.pmo/sprints/*/requirements.md` | Parse `[requirement:uuid:...]` lines |
| Tasks | `scrum.pmo/sprints/*/task-*.md` | Parse status, traceability up/down/follows |
| Use Cases | `qnd/spec/traceability-matrix.md` | Parse table rows: UUID, UC, object.verb |
| Classes | `qnd/spec/usecase-tree.md` + git | Parse tree structure + `git log --follow` |
| Methods | TypeScript AST + traceability-matrix.md | `Impl File:Method` column |
| Tests | `qnd/test/vitest/*.test.ts` + traceability-matrix.md | `Test File:Line` column |
| Units | `*.ts.unit` + `MDAv4/M3/CLASS/*.unit` | JSON scenario files |
| Commits | `git log --format` per file | SHA + date + message |

### Browser Implementation
- **Server:** ONCE HTTP route at `/traceability` serves the browser app
- **Client:** Single-page Lit view (Web4 P27) with tree nav + detail panel
- **Data:** Server parses markdown/PUML/JSON on request, returns JSON API
- **Render:** LitElement components for each entity type
- **Filter:** Client-side filtering on the JSON dataset

## Acceptance Criteria (FORWARD-ONLY)
- [ ] Requirement panel shows: name, altId, description, forwardTo.tasks[]
- [ ] Task panel shows: forwardTo.subtasks[], forwardTo.useCases[], forwardTo.changes[] — NO links.up
- [ ] UseCase panel shows: object, verb, source, forwardTo.classes[] — NO back-ref to tasks/requirements
- [ ] Class panel shows: source, commit, lines, forwardTo.methods[], unit file — NO back-ref to UCs
- [ ] Method panel shows: source, commit, lines — LEAF, no forward links
- [ ] Clicking a forward link drills deeper (never navigates up)
- [ ] Fan-in: same Task appears under multiple Requirements in tree
- [ ] Tree depth controls work (1/2/3/∞)
- [ ] Filter by class name shows Requirements→...→that class (forward path)
- [ ] Filter by UC category shows Requirements→Tasks→matching UCs
- [ ] NO entity has a "parent" or "up" field — forward-only enforced in data model
- [ ] Data sourced from existing markdown/PUML/JSON — no manual entry
- [ ] **PENDING:** Wait for planner's updated AC list before expert implementation

---

**Designed by:** web4-po @ web4team:0.0
**Task:** T158 (planner directive)
**Sprint:** Sprint 3 — QnD Multiplayer Game
