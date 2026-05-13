[Back to Sprint 3 Planning](./planning.md)

# Task 47: BUG — Leave Button Regression

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Leave button in game room stopped working — was fixed in Task 38.13 (LEAVE_ROOM hides game, shows lobby, refreshes rooms) but has regressed. Likely broken by recent CSS/header changes (38.15-38.21) or Task 44 room cleanup changes.

## Debug
1. Check if leave button click handler still exists in MultiplayerUI.ts
2. Check if the button element is still rendered (may have been removed in header refactor)
3. Check if LEAVE_ROOM WebSocket message is still sent
4. Check if lobby show/game hide logic still fires after leave

## Acceptance Criteria
- [ ] Leave button visible in game room header
- [ ] Clicking sends LEAVE_ROOM to server
- [ ] Game view hides, lobby view shows
- [ ] Room list refreshes after returning to lobby
- [ ] Rebuilt with esbuild
