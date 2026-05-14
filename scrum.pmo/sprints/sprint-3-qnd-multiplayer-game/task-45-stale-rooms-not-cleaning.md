[Back to Sprint 3 Planning](./planning.md)

# Task 45: BUG — 20+ Stale Rooms Not Being Cleaned Up

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done — tester INCONCLUSIVE on timer verification

## Problem
Despite Task 44 implementing room cleanup, 20+ stale rooms are still visible in the lobby. The auto-dispose timer or cleanup logic is not working correctly.

## Debug
1. Check if periodic cleanup timer is actually running (setInterval in server.ts)
2. Check stale criteria — are finished rooms meeting the criteria?
3. Check if ROOM_LIST broadcast happens after cleanup
4. Check server logs for cleanup activity
5. May need to restart server for new cleanup code to take effect

## Acceptance Criteria
- [ ] No more than 3-5 rooms visible in lobby at any time
- [ ] Finished rooms auto-removed within 1 minute
- [ ] Rooms with no humans auto-removed
- [ ] Server restart clears all stale rooms
- [ ] Rebuilt with esbuild
