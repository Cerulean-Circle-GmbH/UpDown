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

**No `[impl:uuid]` or `[class:uuid]` markers exist in source yet.** The matrix `Impl File:Method` column is the ONLY current source for UC→Class→Method links. If richer per-method traceability is needed later, add `[impl:uuid:X]` markers to source — but that's a separate task, not T178.

---

## Expert Implementation Steps

1. **In traceChainBuilder.ts** (T160 parser): after parsing Req→Task→Subtask, add:
2. Parse traceability-matrix.md table rows
3. For each row: create UseCaseNode, match to TaskNode by sprint/task-number, link `task.forwardTo.useCases.push(uc)`
4. For each row: parse `Impl File:Method` column → create ClassNodes + MethodNodes, link `uc.forwardTo.classes.push(class)`, `class.forwardTo.methods.push(method)`
5. For each row: parse `Test File:Line` column → create TestNode, attach `uc.tests.push(test)`
6. Bonus: grep test files for `[uc:uuid:]` markers → cross-check matrix, report orphans
7. Dedup: same Class appearing in multiple UCs shares one ClassNode instance

---

## Acceptance Criteria
- [ ] AC-1: `task.forwardTo.useCases[]` populated for all tasks that appear in traceability-matrix.md Task column
- [ ] AC-2: `useCase.forwardTo.classes[]` populated from matrix Impl column (≥1 class per covered UC)
- [ ] AC-3: `class.forwardTo.methods[]` populated — each class has its methods from the matrix
- [ ] AC-4: `useCase.tests[]` populated from matrix Test column + `[uc:uuid:]` markers
- [ ] AC-5: Class deduplication — GameRoom appears once with all its methods, not duplicated per UC
- [ ] AC-6: 44 tests link through full chain to a Requirement root (zero orphans for covered UCs)
- [ ] AC-7: `/api/trace/chain` JSON includes populated UC/Class/Method/Test arrays
- [ ] AC-8: /trace browser tree expands past Task level into UC→Class→Method

## Test Scenarios
- [ ] TS-1: UC-R2 (room.create) has classes [WebSocketClient, RoomManager, GameRoom] in forwardTo.classes[]
- [ ] TS-2: GameRoom class has methods [addPlayer, removePlayer, startGame, nextRound, playCard, resolveRound, endGame]
- [ ] TS-3: UC-R2 has test "uc-r2-room-create.test.ts" with aceCount=7 in tests[]
- [ ] TS-4: Walk R1→T1→UC-C1→WebSocketClient→connect() — full chain resolved
- [ ] TS-5: Walk backward from uc-b1-bot-add.test.ts → UC-B1 → T14 → Requirement — reachable
- [ ] TS-6: Orphan report: zero orphan tests for covered UCs

---

**Architect:** web4-architect @ web4team:0.0
**Sprint:** Sprint 17 — Scenario Units
