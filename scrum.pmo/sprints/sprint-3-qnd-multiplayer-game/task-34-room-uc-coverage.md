[Back to Sprint 3 Planning](./planning.md)

# Task 34: Room Use Case Test Coverage (R7, R8, R9, R11)
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-340000000001]

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:d0b57a5a] UC-R7: room.join.full
    - [uc:uuid:8db2e073] UC-R8: room.join.midGame
    - [uc:uuid:d466a7f1] UC-R9: room.join.rejected
    - [uc:uuid:4a7e2b19] UC-R11: room.share
  - down
    - [Task 34.1: Expert — vitest for R7/R8/R9](./task-34.1-expert-room-edge-tests.md)
    - [Task 34.2: Tester — verify share links work end-to-end](./task-34.2-tester-share-link-verify.md)

## Task Description
Write vitest tests for room edge cases identified as MISSING in traceability matrix. Plus verify share links actually work when entered in browser.

## Subtasks

### 34.1: Expert — vitest for R7/R8/R9
- UC-R7: Join full room → ERROR response
- UC-R8: Join during exchange phase → OK
- UC-R9: Join during countdown → ERROR
- Add [uc:uuid] annotations matching matrix

### 34.2: Tester — verify share links end-to-end
- Create room via WebSocket, get invite URL from ROOM_JOINED
- Open invite URL in second connection → verify joins room
- Test pre-created room links: ?join=2p, ?join=3p, ?join=party
- Test expired/random UUID link → verify proper error
- Report PASS/FAIL per link type

## Acceptance Criteria
- [ ] vitest/uc-r7-room-join-full.test.ts exists and PASS
- [ ] vitest/uc-r8-room-join-midgame.test.ts exists and PASS
- [ ] vitest/uc-r9-room-join-rejected.test.ts exists and PASS
- [ ] Share link for user-created room works (tester verified)
- [ ] Share link for pre-created rooms works (tester verified)
- [ ] Expired link returns proper error (tester verified)
- [ ] traceability-matrix.md updated: R7/R8/R9 → COVERED
