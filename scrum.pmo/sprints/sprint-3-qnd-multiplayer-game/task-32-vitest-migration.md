[Back to Sprint 3 Planning](./planning.md)

# Task 32: Vitest Migration — UC-based Test Suite with Full Traceability
[task:uuid:a1b2c3d4-e5f6-7890-abcd-320000000000]

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - Use case diagram: `qnd/spec/qnd-usecase-diagram.puml`
    - Traceability matrix: `qnd/spec/traceability-matrix.md`
    - Coverage audit: `qnd/spec/usecase-coverage.md` (17% → target 80%+)
  - down
    - [Task 32.1: UC-C1 connection.open](./task-32.1-tester-uc-c1-connection.md)
    - [Task 32.2: UC-R2 room.create](./task-32.2-tester-uc-r2-room-create.md)
    - [Task 32.3: UC-R4 room.join](./task-32.3-tester-uc-r4-room-join.md)
    - [Task 32.4: UC-G1 game.start](./task-32.4-tester-uc-g1-game-start.md)
    - [Task 32.5: UC-P1 player.guess](./task-32.5-tester-uc-p1-player-guess.md)
    - [Task 32.6: UC-B1 bot.add](./task-32.6-tester-uc-b1-bot-add.md)
    - [Task 32.7: UC-S1 spectator.join](./task-32.7-tester-uc-s1-spectator.md)
    - [Task 32.8: UC-CH1 chat.send](./task-32.8-tester-uc-ch1-chat.md)
    - [Task 32.9: UC-GE1 game.end](./task-32.9-tester-uc-ge1-game-end.md)

## Task Description
Replace hand-rolled protocol-test-suite.js with professional vitest tests. Each top-level use case (UC1-UC26 from qnd-usecase-diagram.puml) becomes a vitest describe() block with full UUID traceability.

## Process per UC (CMM4 — PDCA for each test)
1. **PLAN:** Read UC from traceability-matrix.md — get UUID, impl file:line, current test status
2. **DO:** Tester writes task file (32.N) with acceptance criteria → Architect reviews AC → Tester creates vitest
3. **CHECK:** Run vitest — all tests PASS. Update traceability-matrix.md with new test file:line
4. **ACT:** If test reveals bug → file bug report → expert fixes → re-test

## Coordination
- **Tester (upDownTeam:0.4):** Creates task files + writes vitest tests
- **Architect (upDownTeam:0.1):** Reviews acceptance criteria match UC spec
- **SM (TRONinterface:0.1):** Monitors quality, unblocks permissions
- **Expert (upDownTeam:0.2):** Fixes bugs found by tests

## Test Structure
```
qnd/test/vitest/
├── uc-c1-connection-open.test.ts     // @uc:uuid:92a061e0
├── uc-r2-room-create.test.ts         // @uc:uuid:fbfed148
├── uc-r4-room-join.test.ts           // @uc:uuid:9cc60247
├── uc-g1-game-start.test.ts          // @uc:uuid:560d9a46
├── uc-p1-player-guess.test.ts        // @uc:uuid:f0295f28
├── uc-b1-bot-add.test.ts             // @uc:uuid:f1ba3e42
├── uc-s1-spectator-join.test.ts      // @uc:uuid:d0b57a5a (new)
├── uc-ch1-chat-send.test.ts          // @uc:uuid: (new)
└── uc-ge1-game-end.test.ts           // @uc:uuid:38d62fef
```

## Vitest Config
```typescript
// qnd/vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['test/vitest/**/*.test.ts'],
    testTimeout: 15000,  // WebSocket tests need time
  }
});
```

## Acceptance Criteria
- [ ] vitest.config.ts created for qnd/
- [ ] At least 9 top-level UC test files created (one per UC category)
- [ ] Each test file has @uc:uuid comment linking to traceability matrix
- [ ] Each test has describe() named `UC-XX object.verb [uuid]`
- [ ] Each acceptance criterion from task file = one it() block
- [ ] All tests PASS via `npx vitest run`
- [ ] traceability-matrix.md updated with new vitest file:line references
- [ ] Coverage: 17% → 50%+ of use cases tested
