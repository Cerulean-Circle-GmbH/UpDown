[Back to Sprint 3 Planning](./planning.md)

# Task 55: BUG — Creating Second Room After Game is Broken

## Status
- [x] Planned
- [ ] Architect Analysis
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem (Tron report)
After finishing a game and returning to lobby, creating a SECOND room is broken. Either:
1. Player is not host of the new room, OR
2. The new room is accidentally the same room as the finished one (reused ID/state)

This suggests room state isn't being fully cleaned up after a game ends, or client-side state from the previous room is leaking into the new room creation.

## Architect Must Analyze
1. Client state: does MultiplayerUI/LobbyUI clear all previous room state when returning to lobby?
2. Room ID: does CREATE_ROOM generate a fresh ID or reuse the old one?
3. Host assignment: does the creator become host on the new room?
4. Server: is the old finished room still in memory interfering with the new one?
5. WebSocket: is the client still subscribed to the old room's events?
6. Check: does the client send the correct clientId on CREATE_ROOM after a previous game?

## Acceptance Criteria
- [ ] After finishing game → return to lobby → create new room: player is host
- [ ] New room has fresh ID (not reusing finished room)
- [ ] No state leakage from previous game
- [ ] Works for multiple sequential games (3+ room creations)
- [ ] Rebuilt with esbuild + server restarted
