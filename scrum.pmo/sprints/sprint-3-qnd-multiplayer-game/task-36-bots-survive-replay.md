[Back to Sprint 3 Planning](./planning.md)

# Task 36: Bots Survive Replay
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-360000000001]

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Bug
Tron: "created a room, added 3 bots, played, played again — bots were not in the room anymore."

## Root Cause
GameRoom.resetForReplay() lines 616-620 deliberately removes all bots:
```typescript
for (const botId of this.bots.keys()) {
  this.players.delete(botId);
}
this.bots.clear();
```

## Correct Behavior
Bots should STAY in the room on replay, same as human players. Reset their scores/alive/streak but keep them as players. They'll play again automatically when host starts next game.

## Fix
- resetForReplay(): do NOT delete bots from players map or clear bots map
- Reset bot state same as human players (score=0, alive=true, streak=0)
- ROOM_RESET broadcast must include bots in player list

## Acceptance Criteria
- [ ] Play with 3 bots → Play Again → 3 bots still in room
- [ ] Bot scores reset to 0
- [ ] Host starts new game → bots play again
- [ ] Bots show in player list after replay
