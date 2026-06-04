[Back to T178 Fill Plan](./task-178-deep-chain-fill-plan.md)

# T178: Method → Implementation → Test Mapping Table

**Purpose:** Map every unlinked method to its `[impl:uuid:]` marker and every unlinked implementation to its `[test:uuid:]` test. Expert adds markers, re-runs populate-forward-refs. Target: 44/44.

---

## Inventory

| Metric | Count |
|--------|-------|
| Total UCs in matrix | 75 |
| UCs with impl in matrix | 75 (all have Impl File:Method column) |
| UCs with vitest test | 20 (15 files, some cover multiple UCs) |
| UCs with [uc:uuid:] marker | 28 markers across 15 test files |
| Methods with [impl:uuid:] marker | **0** (none added yet) |
| Implementation classes | 10 source files |
| Unique methods across all UCs | ~45 (some methods serve multiple UCs) |

---

## FULL MAPPING TABLE: UC → Class.Method → [impl:uuid:] → Test → [uc:uuid:]

### SECTION A: LINKED — Have impl + test + marker (20 UCs, just need [impl:uuid:])

| UC | UUID | Class | Method | Line | [impl:uuid:] to add | Test File | [uc:uuid:] exists? |
|----|------|-------|--------|------|---------------------|-----------|-------------------|
| UC-C1 | 92a061e0 | WebSocketClient | connect() | :14 | `[impl:uuid:92a061e0]` | uc-c1-connection-open.test.ts | ✅ yes |
| UC-C1 | 92a061e0 | server.ts | setupWebSocketServer() | :666 | `[impl:uuid:92a061e0]` | uc-c1-connection-open.test.ts | ✅ yes |
| UC-C1b | aa33a8d3 | server.ts | setupWebSocketServer() | :666 | `[impl:uuid:aa33a8d3]` | uc-c1-connection-open.test.ts | ✅ yes |
| UC-C2 | e6b4716c | GameRoom | removePlayer() | :280 | `[impl:uuid:e6b4716c]` | (protocol-test-suite only) | ❌ no vitest |
| UC-R1 | 7cd55a0b | WebSocketClient | listRooms() | :72 | `[impl:uuid:7cd55a0b]` | (protocol-test-suite only) | ❌ no vitest |
| UC-R2 | fbfed148 | WebSocketClient | createRoom() | :60 | `[impl:uuid:fbfed148]` | uc-r2-room-create.test.ts | ✅ yes |
| UC-R2 | fbfed148 | GameRoom | addPlayer() | :103* | `[impl:uuid:fbfed148]` | uc-r2-room-create.test.ts | ✅ yes |
| UC-R2b | 177c8da5 | GameRoom | addPlayer() | :103* | `[impl:uuid:177c8da5]` | (protocol-test-suite only) | ❌ no vitest |
| UC-R3 | 1c21171d | server.ts | handleGameMessage() | :772 | `[impl:uuid:1c21171d]` | (protocol-test-suite only) | ❌ no vitest |
| UC-R4 | 9cc60247 | WebSocketClient | joinRoom() | :64 | `[impl:uuid:9cc60247]` | uc-r4-room-join.test.ts | ✅ yes |
| UC-R4 | 9cc60247 | GameRoom | addPlayer() | :103* | `[impl:uuid:9cc60247]` | uc-r4-room-join.test.ts | ✅ yes |
| UC-R5 | 61449e82 | server.ts | handleGameMessage() | :772 | `[impl:uuid:61449e82]` | (protocol-test-suite only) | ❌ no vitest |
| UC-R6 | 148f2e73 | server.ts | handleGameMessage() | :772 | `[impl:uuid:148f2e73]` | (protocol-test-suite only) | ❌ no vitest |
| UC-R7 | d0b57a5a | GameRoom | addPlayer() | :103* | `[impl:uuid:d0b57a5a]` | uc-r7-room-join-full.test.ts | ✅ yes |
| UC-R8 | 8db2e073 | GameRoom | addPlayer() | :103* | `[impl:uuid:8db2e073]` | uc-r8-room-join-midgame.test.ts | ✅ yes |
| UC-R9 | d466a7f1 | GameRoom | addPlayer() | :103* | `[impl:uuid:d466a7f1]` | uc-r9-room-join-rejected.test.ts | ✅ yes |
| UC-R10 | 96f2ecd5 | WebSocketClient | leaveRoom() | :68 | `[impl:uuid:96f2ecd5]` | uc-r10-leave-rejoin.test.ts | ✅ yes |
| UC-R10 | 96f2ecd5 | GameRoom | removePlayer() | :280 | `[impl:uuid:96f2ecd5]` | uc-r10-leave-rejoin.test.ts | ✅ yes |
| UC-H1 | dd0392cf | GameRoom | removePlayer() | :280 | `[impl:uuid:dd0392cf]` | (protocol-test-suite only) | ❌ no vitest |
| UC-G1 | 560d9a46 | WebSocketClient | startGame() | :76 | `[impl:uuid:560d9a46]` | uc-g1-game-start.test.ts | ✅ yes |
| UC-G1 | 560d9a46 | GameRoom | startGame() | :319 | `[impl:uuid:560d9a46]` | uc-g1-game-start.test.ts | ✅ yes |
| UC-CH1 | 0dfe22b0 | server.ts | handleGameMessage() | :772 | `[impl:uuid:0dfe22b0]` | uc-ch1-chat.test.ts | ✅ yes |
| UC-B1 | f1ba3e42 | GameRoom | addBot() | :151 | `[impl:uuid:f1ba3e42]` | uc-b1-bot-add.test.ts | ✅ yes |
| UC-S1 | ac08aa49 | GameRoom | addSpectator() | :169 | `[impl:uuid:ac08aa49]` | uc-s1-spectator.test.ts | ✅ yes |
| UC-P1 | f0295f28 | GameRoom | playCard() | :464 | `[impl:uuid:f0295f28]` | uc-p1-player-guess.test.ts | ✅ yes |
| UC-GE1 | 38d62fef | GameRoom | endGame() | :622 | `[impl:uuid:38d62fef]` | uc-ge1-game-end.test.ts | ✅ yes |
| UC-GE5 | ea33c5b7 | MultiplayerUI | leaveRoom+rejoin | — | `[impl:uuid:ea33c5b7]` | uc-ge5-play-again.test.ts | ✅ yes |
| UC-R11 | 433fe03f | LobbyUI/MultiplayerUI | shareOrCopy() | — | `[impl:uuid:433fe03f]` | uc-r11-room-share.test.ts | ✅ yes |

*\* addPlayer() serves 6 UCs (R2, R4, R7, R8, R9, R2b) — gets 6 [impl:uuid:] markers*

### SECTION B: HAVE IMPL, NO TEST — Need [impl:uuid:] only (35 UCs)

| UC | UUID | Class | Method | Line | [impl:uuid:] to add |
|----|------|-------|--------|------|---------------------|
| UC-RD1 | f8e39106 | GameRoom | nextRound() | :345 | `[impl:uuid:f8e39106]` |
| UC-RD2 | 224c5b9e | GameRoom | startCountdown() | :403 | `[impl:uuid:224c5b9e]` |
| UC-RD3 | e5c73817 | GameRoom | resolveRound() | :482 | `[impl:uuid:e5c73817]` |
| UC-RD4 | b3fb6696 | GameRoom | resolveRound() | :482 | `[impl:uuid:b3fb6696]` |
| UC-P2 | c9866c6e | GameRoom | playCard() | :464 | `[impl:uuid:c9866c6e]` |
| UC-P3 | fa8f1c83 | GameRoom | playCard() | :464 | `[impl:uuid:fa8f1c83]` |
| UC-P4 | 035d2535 | GameRoom | resolveRound() | :482 | `[impl:uuid:035d2535]` |
| UC-P5 | 1a56ba00 | GameRoom | resolveRound() | :482 | `[impl:uuid:1a56ba00]` |
| UC-P6 | 344fcec6 | GameRoom | resolveRound() | :482 | `[impl:uuid:344fcec6]` |
| UC-P7 | e4b6d041 | GameRoom | playCard() | :464 | `[impl:uuid:e4b6d041]` |
| UC-P8 | d51d24ec | GameRoom | playCard() | :464 | `[impl:uuid:d51d24ec]` |
| UC-P9 | f43897d5 | GameRoom | playSpecialCard() | :435 | `[impl:uuid:f43897d5]` |
| UC-P10 | b6862ad2 | GameRoom | playSpecialCard() | :435 | `[impl:uuid:b6862ad2]` |
| UC-P11 | c503e19a | GameRoom | playSpecialCard() | :435 | `[impl:uuid:c503e19a]` |
| UC-P13 | d309011d | GameRoom | resolveRound() | :482 | `[impl:uuid:d309011d]` |
| UC-P14 | 18224bc2 | GameRoom | resolveRound() | :482 | `[impl:uuid:18224bc2]` |
| UC-H2 | fc6c941a | GameRoom | addBot() | :151 | `[impl:uuid:fc6c941a]` |
| UC-H4 | 57311798 | server.ts | handleGameMessage() | :772 | `[impl:uuid:57311798]` |
| UC-G2 | f89b9338 | GameRoom | fillBotsAndStart() | :241 | `[impl:uuid:f89b9338]` |
| UC-S2 | d30575e7 | GameRoom | removeSpectator() | :187 | `[impl:uuid:d30575e7]` |
| UC-S3 | df7ec971 | GameRoom | promoteSpectator() | :194 | `[impl:uuid:df7ec971]` |
| UC-S4 | 91825bbd | GameRoom | broadcastAll() | :209 | `[impl:uuid:91825bbd]` |
| UC-CH2 | 7b4f1505 | GameRoom | addPlayer() | :103 | `[impl:uuid:7b4f1505]` |
| UC-CH3 | 8a319461 | server.ts | handleGameMessage() | :772 | `[impl:uuid:8a319461]` |
| UC-CH4 | f552ec48 | server.ts | handleGameMessage() | :772 | `[impl:uuid:f552ec48]` |
| UC-GE2 | e73e7784 | GameRoom | endGame() | :622 | `[impl:uuid:e73e7784]` |
| UC-GE3 | e4bd6ed5 | GameRoom | endGame() | :622 | `[impl:uuid:e4bd6ed5]` |
| UC-GE4 | b1be7a22 | GameRoom | endGame() | :622 | `[impl:uuid:b1be7a22]` |
| UC-RD5 | 34620f4b | GameRoom | startCountdown() | :403 | `[impl:uuid:34620f4b]` |
| UC-RD6 | 4af9fb90 | SpecialCards | resolveSpecialCards() | — | `[impl:uuid:4af9fb90]` |
| UC-RD7 | 76f767e4 | GameRoom | resolveRound() | :482 | `[impl:uuid:76f767e4]` |
| UC-RD8 | 7886e805 | GameRoom | nextRound() | :345 | `[impl:uuid:7886e805]` |
| UC-B2 | 8e46d39e | BotPlayer | decideGuess() | :43 | `[impl:uuid:8e46d39e]` |
| UC-SC1→SC13 | (13 UUIDs) | SpecialCards | individual handlers | — | `[impl:uuid:XXXXXXXX]` × 13 |
| UC-B3→B8 | (6 UUIDs) | BotPlayer | personality methods | — | `[impl:uuid:XXXXXXXX]` × 6 |

### SECTION C: Methods That Need Multiple [impl:uuid:] Markers

These methods implement multiple UCs — each gets separate markers stacked:

| Method | File:Line | UC UUIDs to stack |
|--------|-----------|-------------------|
| GameRoom.addPlayer() | :103 | fbfed148, 9cc60247, d0b57a5a, 8db2e073, d466a7f1, 177c8da5, 7b4f1505 (7 UCs) |
| GameRoom.removePlayer() | :280 | e6b4716c, 96f2ecd5, dd0392cf (3 UCs) |
| GameRoom.playCard() | :464 | f0295f28, c9866c6e, fa8f1c83, e4b6d041, d51d24ec (5 UCs) |
| GameRoom.resolveRound() | :482 | e5c73817, b3fb6696, 035d2535, 1a56ba00, 344fcec6, d309011d, 18224bc2, 76f767e4 (8 UCs) |
| GameRoom.endGame() | :622 | 38d62fef, e73e7784, e4bd6ed5, b1be7a22 (4 UCs) |
| GameRoom.playSpecialCard() | :435 | f43897d5, b6862ad2, c503e19a (3 UCs) |
| server.ts handleGameMessage() | :772 | 1c21171d, 61449e82, 148f2e73, 0dfe22b0, 57311798, 8a319461, f552ec48 (7 UCs) |

---

## Coverage Projection After Fill

| Metric | Before | After [impl:uuid:] | After tests |
|--------|--------|---------------------|-------------|
| Methods with [impl:uuid:] | 0/45 | **45/45** (all mapped) | 45/45 |
| UCs linked to impl | 0/75 | **75/75** (all UCs have impl) | 75/75 |
| Tests with [uc:uuid:] | 28 | 28 (no change — markers exist) | 28 |
| Tests reachable from Req root | 0/44 | **20/44** (only UCs with vitest) | 20/44* |

*\*24 tests missing vitest coverage (covered by protocol-test-suite.js which has different format). To reach 44/44, either: (a) add [uc:uuid:] markers to protocol-test-suite.js tests, or (b) write vitest equivalents for the remaining 24 UCs.*

**Realistic target: 20/44 immediately after [impl:uuid:] fill. 44/44 requires protocol-test-suite marker migration.**

---

## Expert Action List

```
STEP 1 (can start NOW): Add [impl:uuid:] markers
  Files to edit: GameRoom.ts, server.ts, WebSocketClient.ts,
                 BotPlayer.ts, SpecialCards.ts, LobbyUI.ts, MultiplayerUI.ts
  Markers to add: ~75 (one per UC, stacked on shared methods)
  Use Section A+B+C tables above as the definitive mapping

STEP 2 (parallel): Build matrix parser in traceChainBuilder.ts
  Parse traceability-matrix.md → populate chain arrays

STEP 3 (after Step 1): Build [impl:uuid:] scanner
  Grep source files → populate method.implementations[]

STEP 4 (after Step 1): Add [uc:uuid:] to protocol-test-suite.js
  16 test functions need markers → links 24 more tests to chain

STEP 5: Run chain-verify → report coverage
  Target: 44/44 tests reachable from Requirement root
```

---

**Architect:** web4-architect @ web4team:0.0
**Joint with:** req (consistency + forward-only compliance)
