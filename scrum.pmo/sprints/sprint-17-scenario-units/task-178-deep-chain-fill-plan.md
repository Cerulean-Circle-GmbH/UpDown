[Back to Sprint 17 Planning](./planning.md)

# Task 178: Deep-Chain Fill Plan — Concrete Mapping + Start

**Joint: Architect maps architecture, Req formalizes consistency, Expert writes tooling.**
**Target:** 7-hop chain fully populated, 44/44 tests reachable from Requirement root.

---

## Current State (measured)

| Data | Count | Status |
|------|-------|--------|
| UCs in traceability-matrix.md | ~75 (15 covered, 5 partial, 55 missing impl/test) | Source exists |
| Implementation classes | 10 .ts files (server: 4, client: 6, shared: 4) | Source exists |
| Test files (vitest) | 15 files | Source exists |
| `[uc:uuid:]` markers in tests | 28 markers across 15 files | Exist — linkable |
| `[impl:uuid:]` markers in source | **0** | NOT YET ADDED |
| `[test:uuid:]` markers in tests | **0** (using `[uc:uuid:]` instead) | Reuse [uc:uuid:] |

---

## The LOCKED 7-Hop Chain

```
1. Requirement → 2. Task → 3. UseCase → 4. Class → 5. Method → 6. Implementation → 7. Test
```

**Hop definitions:**
- **Requirement→Task:** which tasks implement this requirement (from requirements.md)
- **Task→UseCase:** which UCs this task covers (from matrix Task column)
- **UseCase→Class:** which classes realize this UC (from matrix Impl column + PUML)
- **Class→Method:** which methods in this class (from matrix Impl column + AST)
- **Method→Implementation:** the actual code location (file:line, commit) — same as method but with source metadata
- **Implementation→Test:** which tests exercise this implementation (from matrix Test column + [uc:uuid:] markers)

Note: Method and Implementation are conceptually merged in the current codebase (method IS the implementation). The distinction matters when a method is abstract (interface) vs concrete (implementation). For QnD, they're the same.

---

## Concrete Architecture Map: UC → Class → Method

### Server Classes

#### GameRoom.ts (12 UCs, 9 methods)

| UC | Method | Line | Coverage |
|----|--------|------|----------|
| UC-R2 room.create | addPlayer() | :103 | ✅ covered |
| UC-R4 room.join | addPlayer() | :103 | ✅ covered |
| UC-R7 room.join.full | addPlayer() size guard | :103 | ✅ vitest |
| UC-R8 room.join.midGame | addPlayer() exchange guard | :103 | ✅ vitest |
| UC-R10 room.leave | removePlayer() | :254 | ✅ covered |
| UC-H1 host.transfer | hostId reassign in removePlayer() | :277 | ✅ covered |
| UC-G1 game.start | startGame() | :290 | ✅ covered |
| UC-B1 bot.add | addBot() | :129 | ✅ vitest |
| UC-RD1 round.start | nextRound() | :315 | partial |
| UC-P1 player.guess | playCard() | :411 | partial |
| UC-RD3 round.resolve | resolveRound() | :428 | partial |
| UC-GE1 game.end | endGame() | :528 | missing test |

#### server.ts (5 UCs, 3 methods)

| UC | Method | Line | Coverage |
|----|--------|------|----------|
| UC-C1 connection.open | setupWebSocketServer() | :303 | ✅ covered |
| UC-R3 room.create.private | key check in ws handler | :422 | ✅ covered |
| UC-R5 room.join.private.correct | key match | :422 | ✅ covered |
| UC-R6 room.join.private.wrong | key mismatch → ERROR | :422 | ✅ covered |
| UC-CH1 chat.send | chat handler | :511 | ✅ vitest |

#### BotPlayer.ts (2 UCs, 2 methods)

| UC | Method | Line | Coverage |
|----|--------|------|----------|
| UC-B1 bot.add | constructor | :1 | ✅ vitest |
| UC-B2 bot.decide | decideGuess() | :127 | missing test |

#### SpecialCards.ts (4+ UCs)

| UC | Method | Coverage |
|----|--------|----------|
| UC-SC1 special.protectiveShell | protective_shell handler | missing test |
| UC-SC2 special.doublePoints | double_points handler | missing test |
| UC-SC3 special.peek | peek handler | missing test |
| UC-SC4 special.sacrifice | sacrifice handler | missing test |

### Client Classes

#### WebSocketClient.ts (5 UCs, 5 methods)

| UC | Method | Line | Coverage |
|----|--------|------|----------|
| UC-C1 connection.open | connect() | :14 | ✅ covered |
| UC-R2 room.create | createRoom() | :60 | ✅ covered |
| UC-R4 room.join | joinRoom() | :64 | ✅ covered |
| UC-R10 room.leave | leaveRoom() | :68 | ✅ covered |
| UC-G1 game.start | startGame() | :76 | ✅ covered |

#### RoomManager.ts (2 UCs, 2 methods)

| UC | Method | Line | Coverage |
|----|--------|------|----------|
| UC-R1 rooms.list | listRooms() | :660 | ✅ covered |
| UC-R2 room.create | createRoom() | :643 | ✅ covered |

---

## Fill Steps (Expert Implementation)

### Step 1: Add `[impl:uuid:]` markers to source files

For each covered UC with a known implementation method, add a single-line comment above the method:

```typescript
// GameRoom.ts
// [impl:uuid:fbfed148] UC-R2: room.create
// [impl:uuid:9cc60247] UC-R4: room.join
addPlayer(id: string, ws: WebSocket, name: string, avatar?: string): void {
```

**Scope:** 15 covered + 5 partial = 20 methods need markers. Each marker is the UC UUID that this method implements.

**Rule:** One method can have MULTIPLE `[impl:uuid:]` markers (addPlayer implements both UC-R2 and UC-R4). The marker is forward FROM the UC, landing AT the method.

### Step 2: Verify `[uc:uuid:]` markers in test files

Already exist (28 markers across 15 files). Verify each test's `[uc:uuid:]` matches a UC in the matrix. Count per file:

```
uc-c1-connection-open.test.ts:  [uc:uuid:92a061e0] [uc:uuid:aa33a8d3]
uc-r2-room-create.test.ts:      [uc:uuid:fbfed148]
uc-r4-room-join.test.ts:         [uc:uuid:9cc60247]
uc-g1-game-start.test.ts:        [uc:uuid:560d9a46]
uc-b1-bot-add.test.ts:           [uc:uuid:f1ba3e42]
uc-ch1-chat.test.ts:             [uc:uuid:0dfe22b0]
uc-p1-player-guess.test.ts:      [uc:uuid:f0295f28]
uc-ge1-game-end.test.ts:         [uc:uuid:38d62fef]
uc-s1-spectator.test.ts:         [uc:uuid:ac08aa49]
uc-r7-room-join-full.test.ts:    [uc:uuid:d0b57a5a]
uc-r8-room-join-midgame.test.ts: [uc:uuid:8db2e073]
uc-r9-room-join-rejected.test.ts:[uc:uuid:d466a7f1]
uc-r10-leave-rejoin.test.ts:     [uc:uuid:96f2ecd5]
uc-r11-room-share.test.ts:       [uc:uuid:...]
uc-ge5-play-again.test.ts:       [uc:uuid:...]
```

### Step 3: Build traceChainBuilder.ts matrix parser

Parse traceability-matrix.md → populate:

```typescript
// For each matrix row:
// 1. task.forwardTo.useCases.push(ucNode)
// 2. ucNode.forwardTo.classes.push(classNode)  
// 3. classNode.forwardTo.methods.push(methodNode)
// 4. ucNode.tests.push(testNode)
```

### Step 4: Build [impl:uuid:] scanner

Grep source files for `[impl:uuid:X]` → cross-reference with matrix → populate `method.implementations[]`:

```typescript
// For each [impl:uuid:X] in source:
// Find UC with uuid X
// Find Class from file name
// Find Method from next function declaration
// Link: method.source = "GameRoom.ts:103"
// Link: method.commit = git log -1 --format=%H -- GameRoom.ts
```

### Step 5: Build [uc:uuid:] scanner for tests

Grep test files for `[uc:uuid:X]` → populate `useCase.tests[]`:

```typescript
// For each [uc:uuid:X] in test file:
// Find UC with uuid X
// Create TestNode { name: filename, ucUuid: X, source: filepath }
// Link: ucNode.tests.push(testNode)
```

### Step 6: Verification — 44/44 tests reach Requirement root

Forward walk from every Requirement:
```
Requirement → task (requirements.md link)
  → useCase (matrix Task column)
    → class (matrix Impl column)
      → method (matrix Impl column + [impl:uuid:])
        → test ([uc:uuid:] in test file)
```

Count: how many of the 44 tests (15 vitest files × ~3 tests each) are reachable?

---

## Migration Tooling (Expert builds)

### Tool 1: `impl-marker-add` — Add [impl:uuid:] to source files

Input: traceability-matrix.md
Output: Comments added to source files above matching methods

```bash
# For each covered UC row in matrix:
# 1. Parse "GameRoom.ts:103 addPlayer()"
# 2. Find the method in the file
# 3. Add "// [impl:uuid:XXXXXXXX] UC-XX: object.verb" above it
```

### Tool 2: `chain-verify` — Walk chain, report coverage

Input: `/api/trace/chain` JSON
Output: Coverage report

```
44 tests total
  → 28 with [uc:uuid:] markers
    → 15 UC matches found
      → 12 with [impl:uuid:] in source
        → 12 reachable from Requirements
  
  Orphans: 16 tests without [uc:uuid:] markers
  Gaps: 3 UCs with tests but no [impl:uuid:]
```

---

## Acceptance Criteria (amended from T178)
- [ ] AC-1: 20+ `[impl:uuid:]` markers added to source files (all covered+partial UCs)
- [ ] AC-2: 28 `[uc:uuid:]` markers verified consistent with matrix UUIDs
- [ ] AC-3: traceChainBuilder parses matrix → populates task.useCases[], uc.classes[], class.methods[]
- [ ] AC-4: traceChainBuilder scans [impl:uuid:] → populates method.implementations[]
- [ ] AC-5: traceChainBuilder scans [uc:uuid:] → populates uc.tests[]
- [ ] AC-6: Class deduplication — GameRoom appears once with all 9 methods
- [ ] AC-7: 44/44 tests reachable from a Requirement root (zero orphans for covered UCs)
- [ ] AC-8: /api/trace/chain returns fully populated 7-hop JSON
- [ ] AC-9: /trace tree expands all 7 levels: Req→Task→UC→Class→Method→Impl→Test
- [ ] AC-10: chain-verify tool reports coverage % and lists orphans
- [ ] AC-11: Zero back-references in any generated data (T159 compliant)

---

## START — Immediate Actions

| Who | Action | Blocked by |
|-----|--------|-----------|
| **Architect** (done) | Map UC→Class→Method architecture (this document) | — |
| **Req** | Formalize each link for consistency + forward-only compliance | This document |
| **Expert** | Step 1: Add [impl:uuid:] markers to 20 methods | Architecture map (this doc) |
| **Expert** | Step 3: Build matrix parser in traceChainBuilder.ts | — |
| **Expert** | Step 4-5: Build [impl:uuid:] + [uc:uuid:] scanners | Step 1 done |
| **Expert** | Step 6: Run chain-verify, report 44/44 coverage | Steps 3-5 done |
| **Tester** | Verify 7-hop tree expansion in /trace browser | All steps done |

**Expert can start Step 1 (markers) and Step 3 (parser) in parallel NOW.**

---

**Architect:** web4-architect @ web4team:0.0
**Sprint:** Sprint 17 — Scenario Units
