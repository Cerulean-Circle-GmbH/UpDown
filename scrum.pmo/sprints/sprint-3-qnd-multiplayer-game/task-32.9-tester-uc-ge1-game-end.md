[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.9: Tester — UC-GE1 game.end vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320900000000]
[uc:uuid:38d62fef]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-GE1 game.end.allEliminated + UC-GE2 deckEmpty + UC-GE3 leaderboard + UC-GE4 diamonds
- **UC UUIDs:** 38d62fef, e73e7784, e4bd6ed5, b1be7a22
- **Implementation:** GameRoom.ts:528 endGame check, :541 endGame(), :545 leaderboard, :550 diamonds

## Acceptance Criteria
1. All players eliminated → GAME_OVER received within 3 seconds
2. Deck + gmHand exhausted → GAME_OVER received
3. GAME_OVER contains leaderboard[] sorted by score DESC, then roundsPlayed DESC
4. Leaderboard entries have: rank (1-indexed), playerId, name, score, rounds, maxStreak, diamonds
5. Diamond calculation: rank 1=50, rank 2=30, rank 3=20, others=0 + roundsPlayed×5 + streakBonus (≥10:25, ≥5:10)
6. Room state is 'finished' after GAME_OVER
7. GAME_OVER contains playAgain:true and roomId for rejoin

## Test File
`qnd/test/vitest/uc-ge1-game-end.test.ts`

## Test Structure
```typescript
// @uc:uuid:38d62fef,e73e7784,e4bd6ed5,b1be7a22
describe('UC-GE1 game.end [38d62fef]', () => {
  it('AC1: all eliminated → GAME_OVER within 3s', async () => { ... });
  it('AC2: deck exhausted → GAME_OVER', async () => { ... });
  it('AC3: leaderboard sorted by score DESC then rounds DESC', async () => { ... });
  it('AC4: leaderboard entries have rank, playerId, name, score, rounds, streak, diamonds', async () => { ... });
  it('AC5: diamond calculation correct (rank + rounds + streak bonus)', async () => { ... });
  it('AC6: room state is finished after GAME_OVER', async () => { ... });
  it('AC7: GAME_OVER has playAgain:true and roomId', async () => { ... });
});
```

## Architect Review
- [x] AC covers both end conditions, leaderboard, diamonds formula, room state
- [x] AC is specific and testable — diamond formula verifiable with exact numbers
