[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.4: Tester — UC-G1 game.start vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320400000000]
[uc:uuid:560d9a46]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-G1 game.start + UC-RD1 round.start + UC-RD2 round.countdown + UC-G2 autoFillBots + UC-H4 nonHost
- **UC UUIDs:** 560d9a46, f8e39106, 224c5b9e, f89b9338, 57311798
- **Implementation:** GameRoom.ts:290 startGame(), :315 nextRound(), :369 startCountdown()

## Acceptance Criteria
1. Host sends START_GAME → all players receive ROUND_START with round:1, currentCard, countdown:10
2. ROUND_START contains alivePlayers[] with all player IDs
3. ROUND_START contains cardsLeft count (deck + gmHand)
4. ROUND_START contains player's inventory[] (starter special cards)
5. Countdown ticks: COUNTDOWN messages with seconds 9,8,7... received
6. Non-host sends START_GAME → ERROR or ignored
7. Auto-fill: start with 1 player + minPlayers > 1 → bots auto-added before game starts

## Test File
`qnd/test/vitest/uc-g1-game-start.test.ts`

## Test Structure
```typescript
// @uc:uuid:560d9a46,f8e39106,224c5b9e,f89b9338,57311798
describe('UC-G1 game.start [560d9a46]', () => {
  it('AC1: START_GAME → ROUND_START with round:1, card, countdown:10', async () => { ... });
  it('AC2: alivePlayers[] contains all player IDs', async () => { ... });
  it('AC3: cardsLeft reflects deck + gmHand size', async () => { ... });
  it('AC4: ROUND_START includes inventory[]', async () => { ... });
  it('AC5: countdown ticks 9,8,7... received', async () => { ... });
  it('AC6: non-host START_GAME rejected', async () => { ... });
  it('AC7: auto-fill bots when below minPlayers', async () => { ... });
});
```

## Architect Review
- [x] AC covers start, round fields, countdown, guards, auto-fill
- [x] AC is specific and testable
