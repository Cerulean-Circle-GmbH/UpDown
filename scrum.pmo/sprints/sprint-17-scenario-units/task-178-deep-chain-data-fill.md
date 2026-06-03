[Back to Sprint 17 Planning](./planning.md)

# Task 178: Deep-Chain Data Fill — UC/Class/Method/Impl/Test Forward Arrays
[task:uuid:d4e5f6a7-b8c9-0123-def4-178000000001]

**Related:** T128.4
**Problem:** Only Req→Task→Subtask is populated. UC/Class/Method/Impl/Test forward arrays are empty.
**Goal:** Every test links through the full chain to a Requirement root.

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement (this design)
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

---

## Current State — What's Populated vs Empty

```
Requirement.forwardTo.tasks[]     ✅ POPULATED (T160 — from requirements.md task links)
  Task.forwardTo.subtasks[]       ✅ POPULATED (T160 — from task file - down section)
  Task.forwardTo.useCases[]       ❌ EMPTY
    UseCase.forwardTo.classes[]   ❌ EMPTY
      Class.forwardTo.methods[]   ❌ EMPTY
        Method (LEAF)             ❌ EMPTY (no methods discovered)
    UseCase.tests[]               ❌ EMPTY (evidence not attached)
```

**Result:** /trace browser shows Req→Task→Subtask tree, then dead ends. 15 vitest files (44 tests) with `[uc:uuid:]` markers exist but are disconnected from the chain.

---

## Design: 5 Hops to Fill

### Hop 1: Task → UseCase (`task.forwardTo.useCases[]`)

**Source:** `traceability-matrix.md` Task column
**Linking rule:** Parse each matrix row. The `Task` column (e.g., "Sprint3/T2") maps to a TaskNode. The UC UUID + object.verb creates a UseCaseNode. Group UCs by task reference.

```
Matrix row: | fbfed148 | UC-R2 | room.create | Sprint3/T2 | ... |
                                                ↑
                                    Parse → Task "Sprint3/T2"
                                    Create → UseCase { uuid:"fbfed148", object:"room", verb:"create" }
                                    Link → task.forwardTo.useCases.push(useCase)
```

**Parser:**
```typescript
// For each row in traceability-matrix.md:
const taskRef = row[3].trim();  // "Sprint3/T2"
const uc: UseCaseNode = {
  uuid: row[0].trim(),
  name: row[1].trim(),
  object: row[2].split('.')[0],
  verb: row[2].split('.')[1],
  coverage: row[6].includes('✅') ? 'covered' : row[6].includes('partial') ? 'partial' : 'missing',
  tests: [],
  forwardTo: { classes: [] }
};
// Match taskRef to existing TaskNode by sprint+number pattern
```

**Match rule:** `Sprint3/T2` → find TaskNode where `task.sprint === "Sprint 3"` AND task name contains "Task 2" or task number is 2.

---

### Hop 2: UseCase → Class (`useCase.forwardTo.classes[]`)

**Source:** `traceability-matrix.md` `Impl File:Method` column
**Linking rule:** Parse the `Impl File:Method` column. Each entry like `GameRoom.ts:103 addPlayer()` yields a Class + Method. Multiple entries separated by ` / `.

```
Matrix: | ... | WebSocketClient.ts:60 createRoom() / RoomManager.ts:643 createRoom() / GameRoom.ts:103 addPlayer() | ... |
              ↑
  Split by " / " → 3 class:method pairs
  For each: extract className, fileName, lineNumber, methodName
  Create ClassNode if not exists, add MethodNode to class.forwardTo.methods[]
  Link useCase.forwardTo.classes.push(classNode)
```

**Parser:**
```typescript
const implEntries = row[4].split(' / ');
for (const entry of implEntries) {
  // Pattern: "FileName.ts:lineNumber methodName()"
  // or: "FileName.ts methodExpression"
  const match = entry.match(/(\w+\.ts)(?::(\d+))?\s+(\w+)\(?/);
  if (match) {
    const [_, fileName, line, methodName] = match;
    const className = fileName.replace('.ts', '');
    // Find or create ClassNode
    // Add MethodNode { name: methodName, source: `${fileName}:${line}` }
  }
}
```

---

### Hop 3: Class → Method (`class.forwardTo.methods[]`)

**Source:** Same as Hop 2 — `traceability-matrix.md` `Impl File:Method` column creates both Class and Method nodes simultaneously.

**Additional source:** TypeScript AST extraction (if richer method data needed — signature, line range). For now, the matrix provides method name + source:line which is sufficient.

**Deduplication:** Same class appears in multiple UC rows. Class node is created once, methods accumulated:
```
UC-R2: GameRoom.ts:103 addPlayer()  → ClassNode("GameRoom") + MethodNode("addPlayer", :103)
UC-R4: GameRoom.ts:103 addPlayer()  → same ClassNode, same MethodNode (dedup by name+line)
UC-G1: GameRoom.ts:290 startGame()  → same ClassNode + NEW MethodNode("startGame", :290)
```

---

### Hop 4: UseCase → Test (`useCase.tests[]` evidence)

**Source:** `traceability-matrix.md` `Test File:Line` column + `[uc:uuid:]` markers in test files.

**Linking rule — two sources, merge:**

**Source A:** Matrix `Test File:Line` column:
```
Matrix: | ... | vitest/uc-r2-room-create.test.ts (7 AC) | ✅ |
              ↑
  Parse → TestNode { name: "uc-r2-room-create.test.ts", aceCount: 7, source: "vitest/uc-r2..." }
  Link → useCase.tests.push(testNode)
```

**Source B:** `[uc:uuid:]` markers in test source files:
```typescript
// In uc-c1-connection-open.test.ts:
// [uc:uuid:92a061e0] UC-C1: connection.open
// [uc:uuid:aa33a8d3] UC-C1b: connection.open.multi
```
Parse: grep `[uc:uuid:XXXXXXXX]` from test files → map UC UUID to test file.

**Merge rule:** Matrix is primary source (has AC count). Test file markers confirm the link and add any UCs the matrix missed.

---

### Hop 5: Full Chain Verification

After hops 1-4, the chain should be:
```
Requirement → Task → UseCase → Class → Method
                       ↓
                     Tests (evidence)
```

**Verification:** Walk from each of the 44 tests backward through the chain:
1. Test has `[uc:uuid:X]` → find UseCaseNode with uuid X
2. UseCaseNode is in some TaskNode.forwardTo.useCases[]
3. TaskNode is in some RequirementNode.forwardTo.tasks[]
4. → Test is reachable from a Requirement root ✅

**Orphan detection:** Any test whose `[uc:uuid:X]` doesn't match a UseCaseNode = orphan. Report as gap.

---

## Source Data Summary — What Drives Each Hop

| Hop | From → To | Source File | Parse Target | Marker Format |
|-----|-----------|-------------|-------------|---------------|
| 1 | Task → UC | traceability-matrix.md | Task column | "Sprint3/T2" |
| 2 | UC → Class | traceability-matrix.md | Impl File:Method column | "File.ts:line method()" |
| 3 | Class → Method | traceability-matrix.md | Same as Hop 2 | Same |
| 4a | UC → Test | traceability-matrix.md | Test File:Line column | "vitest/uc-XX.test.ts (N AC)" |
| 4b | UC → Test | test source files | `[uc:uuid:]` comments | `// [uc:uuid:XXXXXXXX]` |
| 5 | Verify | all of above | forward walk | all 44 tests reach a Req root |

---

## Addendum: PUML + Source Marker Linking Rules (PO directive)

### PUML as Source for UC→Class

The use-case diagram (`qnd-usecase-diagram.puml`) has actor→UC arrows only. BUT the traceability diagram (`traceability-diagram.puml`) has **Impl cards** with class:method text per UC chain:

```puml
' traceability-diagram.puml line 177:
card "**Impl** WebSocketClient.ts:60 createRoom()\nRoomManager.ts:643 createRoom()\nGameRoom.ts:103 addPlayer()" as CH2I #FFF3E0
```

**Linking rule:** Parse traceability-diagram.puml `card "**Impl**"` entries → extract Class.ts:line method() → same as Hop 2 but from PUML source instead of (or in addition to) the matrix.

**Priority:** Matrix is primary (has Test column too). PUML is secondary/verification source. If both exist, merge and report discrepancies.

### Class Diagram PUML → Class.methods[]

If a class diagram PUML exists for QnD (currently doesn't), it would provide the authoritative Class→Method list via:
```puml
class GameRoom {
  +addPlayer(id, ws, name, avatar)
  +removePlayer(clientId)
  +startGame()
  ...
}
```
**Future:** When QnD gets a class diagram, Class.methods[] should be populated from PUML class body, not just from matrix Impl column. Until then, matrix suffices.

### `[impl:uuid]` Markers in Source Files

**Spec for expert to add:**
```typescript
// In GameRoom.ts:
// [impl:uuid:fbfed148] UC-R2: room.create
addPlayer(id: string, ws: WebSocket, name: string, avatar?: string): void {
```

**Format:** `// [impl:uuid:<uc-uuid-8char>] <UC-name>: <object.verb>`
- Placed as single-line comment ABOVE the method
- Links this method FORWARD from the UseCase that owns it
- NOT a back-reference — the UC UUID is the forward source, the marker is WHERE it lands

**Linking rule:**
```typescript
// Parse source files for [impl:uuid:X] markers
const implMatch = line.match(/\/\/\s*\[impl:uuid:([0-9a-f]{8})\]/);
if (implMatch) {
  const ucUuid = implMatch[1];
  // Find UseCaseNode with this UUID
  // Find ClassNode from current file
  // Find MethodNode from next function declaration
  // Link: useCase.forwardTo.classes → class, class.forwardTo.methods → method
}
```

**Advantage over matrix-only:** Method-level precision. The matrix says "GameRoom.ts:103 addPlayer()" — the `[impl:uuid]` marker confirms it IN the source. If the method moves to line 150, the marker moves with it (no matrix update needed).

### `[test:uuid]` Markers in Test Files

**Already exist as `[uc:uuid:]`** — rename spec:
```typescript
// In uc-r2-room-create.test.ts:
// [test:uuid:fbfed148] UC-R2: room.create
it('should create room and assign host', async () => {
```

**Current format (already in 15 test files):**
```typescript
// [uc:uuid:92a061e0] UC-C1: connection.open
```

**Decision:** Keep `[uc:uuid:]` format (already deployed in 44 tests). Do NOT rename to `[test:uuid:]` — unnecessary churn. The parser already handles `[uc:uuid:]`.

**Linking rule:**
```typescript
// grep test files for [uc:uuid:X]
// Each match: testFile → ucUuid → find UseCaseNode
// Attach: useCase.tests.push({ name: testFile, ucUuid, ... })
```

### Full Chain with All Sources

```
Requirement (requirements.md)
  └→ Task (task-*.md - down section)
      └→ UseCase (traceability-matrix.md Task column)
          ├→ Class (matrix Impl column + traceability-diagram.puml Impl cards)
          │   └→ Method (matrix Impl column + [impl:uuid:] source markers)
          └→ Test (matrix Test column + [uc:uuid:] test markers)
```

| Hop | Primary Source | Secondary Source | Marker |
|-----|---------------|-----------------|--------|
| Task→UC | matrix Task column | — | `Sprint3/T2` |
| UC→Class | matrix Impl column | traceability-diagram.puml Impl cards | `File.ts:line method()` |
| Class→Method | matrix Impl column | `[impl:uuid:]` in source files | `// [impl:uuid:XXXXXXXX]` |
| UC→Test | matrix Test column | `[uc:uuid:]` in test files | `// [uc:uuid:XXXXXXXX]` |

---

## Expert Implementation Steps

1. **In traceChainBuilder.ts** (T160 parser): after parsing Req→Task→Subtask, add:
2. Parse traceability-matrix.md table rows (primary source for all hops)
3. For each row: create UseCaseNode, match to TaskNode by sprint/task-number, link `task.forwardTo.useCases.push(uc)`
4. For each row: parse `Impl File:Method` column → create ClassNodes + MethodNodes, link `uc.forwardTo.classes.push(class)`, `class.forwardTo.methods.push(method)`
5. For each row: parse `Test File:Line` column → create TestNode, attach `uc.tests.push(test)`
6. **Secondary: parse traceability-diagram.puml** for `card "**Impl**"` entries → cross-check against matrix, report discrepancies
7. **Secondary: grep source files for `[impl:uuid:]`** → cross-check method-level links, report orphans
8. **Secondary: grep test files for `[uc:uuid:]`** → cross-check test links, report orphan tests
9. Dedup: same Class appearing in multiple UCs shares one ClassNode instance
10. **Verification: forward-walk all 44 tests → must reach a Requirement root**

---

## Acceptance Criteria
- [ ] AC-1: `task.forwardTo.useCases[]` populated for all tasks in matrix Task column
- [ ] AC-2: `useCase.forwardTo.classes[]` populated from matrix Impl column (≥1 class per covered UC)
- [ ] AC-3: `class.forwardTo.methods[]` populated — each class has its methods from matrix
- [ ] AC-4: `useCase.tests[]` populated from matrix Test column + `[uc:uuid:]` markers
- [ ] AC-5: Class deduplication — GameRoom appears once with all methods, not duplicated per UC
- [ ] AC-6: 44/44 tests link through full chain to a Requirement root (zero orphans)
- [ ] AC-7: `/api/trace/chain` JSON includes populated UC/Class/Method/Test arrays
- [ ] AC-8: /trace browser tree expands past Task level into UC→Class→Method
- [ ] AC-9: traceability-diagram.puml Impl cards parsed as secondary UC→Class source
- [ ] AC-10: `[impl:uuid:]` spec documented — expert can add markers to source files
- [ ] AC-11: `[uc:uuid:]` markers in 15 test files parsed and linked to UC nodes

## Test Scenarios
- [ ] TS-1: UC-R2 (room.create) has classes [WebSocketClient, RoomManager, GameRoom] in forwardTo.classes[]
- [ ] TS-2: GameRoom class has methods [addPlayer, removePlayer, startGame, nextRound, playCard, resolveRound, endGame]
- [ ] TS-3: UC-R2 has test "uc-r2-room-create.test.ts" with aceCount=7 in tests[]
- [ ] TS-4: Walk R1→T1→UC-C1→WebSocketClient→connect() — full chain resolved
- [ ] TS-5: Walk from uc-b1-bot-add.test.ts → [uc:uuid:f1ba3e42] → UC-B1 → T14 → Requirement — reachable
- [ ] TS-6: Orphan report: zero orphan tests for covered UCs
- [ ] TS-7: traceability-diagram.puml CH2I card → UC-R2 classes match matrix Impl column
- [ ] TS-8: If `[impl:uuid:fbfed148]` added above GameRoom.addPlayer() → parser links it to UC-R2

---

**Architect:** web4-architect @ web4team:0.0
**Sprint:** Sprint 17 — Scenario Units
