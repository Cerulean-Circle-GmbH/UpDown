[Back to Sprint 3 Planning](./planning.md)

# Task 36: Bots Survive Replay
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-360000000001]
[uc:uuid:ea33c5b7,f1ba3e42]

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Traceability
  - up
    - [uc:uuid:ea33c5b7] UC-GE5: game.end.playAgain
    - [uc:uuid:f1ba3e42] UC-B1: bot.add
  - down
    - None (atomic bug fix in GameRoom.ts resetForReplay)

## Use Case Reference
- **UC:** UC-GE5 game.end.playAgain + UC-B1 bot.add
- **UC UUIDs:** ea33c5b7, f1ba3e42
- **Implementation:** GameRoom.ts resetForReplay() — removed bot deletion
- **Commit:** 1631abc39

## Bug
Tron: "created a room, added 3 bots, played, played again — bots were not in the room anymore."

## Root Cause
GameRoom.resetForReplay() deliberately removed all bots:
```typescript
for (const botId of this.bots.keys()) {
  this.players.delete(botId);
}
this.bots.clear();
```

## Acceptance Criteria
1. Play with 3 bots → Play Again → 3 bots still in room player list
2. Bot scores reset to 0 on replay
3. Bot alive=true, streak=0 on replay
4. Host starts new game → bots play again with fresh state
5. ROOM_RESET broadcast includes bots in player list
6. Game-over pane centered (cosmetic fix included)

## Test File
`qnd/test/vitest/uc-b1-bot-add.test.ts` (bot persistence covered here)

## Test Structure
```typescript
// @uc:uuid:f1ba3e42,ea33c5b7
describe('UC-B1 bot.add + replay [f1ba3e42]', () => {
  it('AC1: bots remain after PLAY_AGAIN → ROOM_RESET', async () => { ... });
  it('AC2: bot scores reset to 0', async () => { ... });
  it('AC4: bots play in second game', async () => { ... });
});
```

## Architect Review
- [x] AC matches bug report from Tron
- [x] AC is specific and testable
- [x] Fix preserves bot state correctly in resetForReplay()
