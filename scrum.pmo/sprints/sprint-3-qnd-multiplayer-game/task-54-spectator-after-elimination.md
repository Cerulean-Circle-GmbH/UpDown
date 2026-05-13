[Back to Sprint 3 Planning](./planning.md)

# Task 54: BUG — Eliminated Player Should Spectate Until Game Ends

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem (Tron report)
When a player loses (wrong bet), they should become a spectator and watch the remaining players (including bots) continue until the game ends (last player standing or all eliminated). 

Current behavior: unclear what happens after elimination — player may get stuck, disconnected, or not see the ongoing game.

Expected behavior: eliminated player stays in the room as spectator, sees all remaining rounds play out, sees the final winner, then gets Play Again / Return to Lobby options.

## Acceptance Criteria
- [ ] Eliminated player transitions to spectator view (not kicked from room)
- [ ] Spectator sees remaining players' rounds play out live
- [ ] Spectator sees cards being played, results, eliminations
- [ ] When game ends (1 player left or all out), spectator sees final results
- [ ] Spectator gets Play Again / Return to Lobby after game over
- [ ] Bot rounds play out visibly for spectators
- [ ] Rebuilt with esbuild + server restarted
