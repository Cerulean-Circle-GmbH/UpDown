[Back to Sprint 3 Planning](./planning.md)

# Task 44: Watch → Remove Button on Finished Rooms + Auto-Remove Stale Rooms

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirement (Tron)
1. Finished rooms show a "Remove" button instead of "Watch" in the lobby
2. Stale rooms are auto-removed when a new room is created
3. Room disposal: finished/abandoned rooms must be cleaned up (game finished, all players left, timeout)

## Subtasks
- [ ] 44.1: Expert — Server: define stale room criteria (game finished + no humans, all disconnected, timeout after X minutes)
- [ ] 44.2: Expert — Server: auto-dispose stale rooms on new room creation and on periodic timer
- [ ] 44.3: Expert — Client: show "Remove" button on finished/stale rooms in lobby instead of "Watch"
- [ ] 44.4: Expert — Server: handle REMOVE_ROOM message from lobby
- [ ] 44.5: Tester — Verify stale rooms cleaned up, Remove button works, no accumulation

## Acceptance Criteria
- [ ] Finished rooms show "Remove" button in lobby (not "Watch")
- [ ] Creating a new room triggers cleanup of stale rooms
- [ ] Rooms with no humans for X minutes auto-disposed
- [ ] Game-finished rooms with all players left auto-disposed
- [ ] Dead rooms don't accumulate on server
- [ ] Room list stays clean after multiple game sessions
- [ ] Rebuilt with esbuild
