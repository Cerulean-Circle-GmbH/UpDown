[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.6: Tester — UC-B1 bot.add vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320600000000]
[uc:uuid:f1ba3e42]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-B1 bot.add + UC-B2 bot.decide + UC-B8 bot.playDelayed
- **UC UUIDs:** f1ba3e42, 8e46d39e, 2d695025
- **Implementation:** GameRoom.ts:129 addBot() / BotPlayer.ts:127 decideGuess()

## Acceptance Criteria
1. Host sends ADD_BOT → PLAYER_JOINED broadcast with isBot indicator in name (🤖)
2. Non-host sends ADD_BOT → ERROR or ignored
3. Bot plays during round (CARD_PLAYED received for bot ID within countdown)
4. Bot makes reasonable decisions (card=2 → bot picks 'up' most of the time with cautious personality)
5. Bot plays with delay (not instant — CARD_PLAYED arrives 1-8s after ROUND_START)
6. Multiple bots can be added to same room

## Test File
`qnd/test/vitest/uc-b1-bot-add.test.ts`

## Test Structure
```typescript
// @uc:uuid:f1ba3e42,8e46d39e,2d695025
describe('UC-B1 bot.add [f1ba3e42]', () => {
  it('AC1: ADD_BOT → PLAYER_JOINED with bot name', async () => { ... });
  it('AC2: non-host ADD_BOT rejected', async () => { ... });
  it('AC3: bot plays during round', async () => { ... });
  it('AC4: bot makes probabilistic decisions', async () => { ... });
  it('AC5: bot plays with delay (not instant)', async () => { ... });
  it('AC6: multiple bots in same room', async () => { ... });
});
```

## Architect Review
- [x] AC covers add, guard, decision, delay, multi-bot
- [x] AC is specific and testable
