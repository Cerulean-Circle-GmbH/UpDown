[Back to Sprint 3 Planning](./planning.md)

# Task 46: BUG — No Finish/Dispose Button on Rooms

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
There is no button to dispose/finish a room. Finished game rooms pile up in the lobby with no way for the host to remove them. This is why 20+ stale rooms accumulate (Task 45).

## Fix
Add a "Finish" button on room cards in the lobby for the room owner/host:
1. Visible on rooms where the game is finished or the user is the owner
2. Clicking sends REMOVE_ROOM or DISPOSE_ROOM to server
3. Server removes the room from the room list
4. Broadcasts updated ROOM_LIST to all connected clients
5. Room is gone from lobby immediately

## Acceptance Criteria
- [ ] Room owner sees "Finish" button on their rooms in the lobby
- [ ] Clicking removes the room from server and lobby
- [ ] Other players see the room disappear from their lobby
- [ ] Non-owners do NOT see the Finish button
- [ ] Works on both finished and in-progress rooms (owner can always dispose)
- [ ] Rebuilt with esbuild
