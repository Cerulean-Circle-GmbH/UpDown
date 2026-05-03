[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.5: Tester — UC-P1 player.guess vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320500000000]
[uc:uuid:f0295f28]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-P1/P2/P3 guess up/down/equal + UC-P4/P5 correct/wrong + UC-P6 timeout + UC-P13/P14 streak/score + UC-RD4 allPlayed
- **UC UUIDs:** f0295f28, c9866c6e, fa8f1c83, 035d2535, 1a56ba00, 344fcec6, d309011d, 18224bc2, b3fb6696
- **Implementation:** GameRoom.ts:411 playCard(), :428 resolveRound(), :458-492 scoring

## Acceptance Criteria
1. PLAY_CARD with guess:'up' → CARD_PLAYED broadcast with playerId, hasPlayed:true
2. PLAY_CARD with guess:'down' → same broadcast pattern
3. PLAY_CARD with guess:'equal' → same broadcast pattern
4. Correct guess (up when next > current) → ROUND_RESULT: correct:true, eliminated:false, score increased by 10+streak
5. Wrong guess → ROUND_RESULT: correct:false, eliminated:true, streak reset to 0
6. Equal guess correct (same numericValue) → correct:true
7. No guess before timeout (10s) → eliminated in ROUND_RESULT with guess:null
8. All alive players played → countdown cancels, immediate ROUND_RESULT (early resolution)
9. Streak increments: round1 correct streak=1, round2 correct streak=2, score includes streak bonus
10. Dead player sends PLAY_CARD → silently ignored (no CARD_PLAYED broadcast)
11. Frozen player sends PLAY_CARD → unfreezes but turn skipped

## Test File
`qnd/test/vitest/uc-p1-player-guess.test.ts`

## Test Structure
```typescript
// @uc:uuid:f0295f28,c9866c6e,fa8f1c83,035d2535,1a56ba00,344fcec6,d309011d,18224bc2,b3fb6696
describe('UC-P1 player.guess [f0295f28]', () => {
  it('AC1: guess up → CARD_PLAYED broadcast', async () => { ... });
  it('AC2: guess down → CARD_PLAYED broadcast', async () => { ... });
  it('AC3: guess equal → CARD_PLAYED broadcast', async () => { ... });
  it('AC4: correct guess → score += 10+streak, not eliminated', async () => { ... });
  it('AC5: wrong guess → eliminated, streak=0', async () => { ... });
  it('AC6: equal correct when same value', async () => { ... });
  it('AC7: timeout → eliminated with guess:null', async () => { ... });
  it('AC8: all played → early resolution', async () => { ... });
  it('AC9: streak accumulates across rounds', async () => { ... });
  it('AC10: dead player guess ignored', async () => { ... });
  it('AC11: frozen player guess unfreezes but skips', async () => { ... });
});
```

## Architect Review
- [x] AC covers all 3 guess types, correct/wrong, timeout, streak, edge cases
- [x] AC is specific and testable — scoring formula verifiable
