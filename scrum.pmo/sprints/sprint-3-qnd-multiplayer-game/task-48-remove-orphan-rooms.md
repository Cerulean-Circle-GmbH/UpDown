[Back to Sprint 3 Planning](./planning.md)

# Task 48: Remove Button on Orphan/Hostless Rooms

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Task 46 added Remove button only for the room owner/host. But stale rooms where the host disconnected have no owner present — nobody can remove them manually. They sit in the lobby until the auto-cleanup timer catches them (2 min).

## Fix
Any player should see a Remove button on rooms that:
1. Have no host connected (orphan rooms)
2. Are in finished state with no active players
3. Are empty (0 players)

This gives everyone the ability to clean up dead rooms, not just the original host.

## Acceptance Criteria
- [ ] Orphan rooms (host disconnected) show Remove button for all users
- [ ] Empty rooms show Remove button for all users
- [ ] Finished + no active players show Remove button for all users
- [ ] Active rooms with host still only show Remove to host
- [ ] Rebuilt with esbuild
