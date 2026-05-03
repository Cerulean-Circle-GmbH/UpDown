[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.7: Tester — UC-S1 spectator vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320700000000]
[uc:uuid:ac08aa49]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-S1 spectator.join + UC-S2 spectator.leave + UC-S3 spectator.joinNext + UC-S4 spectator.seesGame
- **UC UUIDs:** ac08aa49, d30575e7, df7ec971, 91825bbd
- **Implementation:** GameRoom.ts:146 addSpectator(), :159 removeSpectator(), :169 promoteSpectator()

## Acceptance Criteria
1. SPECTATE with roomId → SPECTATE_JOINED with room info, players[], currentCard, round, state
2. Other players/spectators receive SPECTATOR_JOINED with spectatorCount
3. Spectator receives ROUND_START, COUNTDOWN, ROUND_RESULT, GAME_OVER (sees full game)
4. Spectator does NOT receive CARD_PLAYED for their own actions (can't play)
5. LEAVE_SPECTATE → SPECTATOR_LEFT broadcast with updated spectatorCount
6. JOIN_NEXT_GAME during waiting/exchange state → spectator becomes player (ROOM_JOINED)
7. JOIN_NEXT_GAME during countdown → rejected (room full or wrong state)
8. Spectator receives CHAT_HISTORY on join

## Test File
`qnd/test/vitest/uc-s1-spectator.test.ts`

## Test Structure
```typescript
// @uc:uuid:ac08aa49,d30575e7,df7ec971,91825bbd
describe('UC-S1 spectator [ac08aa49]', () => {
  it('AC1: SPECTATE → SPECTATE_JOINED with game state', async () => { ... });
  it('AC2: others notified via SPECTATOR_JOINED', async () => { ... });
  it('AC3: spectator receives game events (ROUND_START etc)', async () => { ... });
  it('AC4: spectator cannot play cards', async () => { ... });
  it('AC5: LEAVE_SPECTATE → SPECTATOR_LEFT', async () => { ... });
  it('AC6: JOIN_NEXT_GAME in waiting → becomes player', async () => { ... });
  it('AC7: JOIN_NEXT_GAME during countdown → rejected', async () => { ... });
  it('AC8: spectator gets CHAT_HISTORY on join', async () => { ... });
});
```

## Architect Review
- [x] AC covers join, see game, leave, promote, edge cases
- [x] AC is specific and testable
