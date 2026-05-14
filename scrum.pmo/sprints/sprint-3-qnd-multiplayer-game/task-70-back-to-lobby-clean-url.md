[Back to Sprint 3 Planning](./planning.md)

# Task 70: Back to Lobby with Clean URL

## Status
- [x] Planned
- [x] In Progress
- [x] QA Review
- [x] Done

## Requirement (Tron)
User must be able to go back to the lobby WITHOUT any room parameters in the URL. Clean URL = lobby view. Add a "Back to Lobby" button that navigates to the base /mp URL with no query params (?join=, ?key= removed).

## Fix
1. Leave button / Back to Lobby should clear URL params: `history.replaceState({}, '', '/mp')`
2. On page load: if no ?join= param → show lobby (already works)
3. After leaving a room: clear URL so refresh shows lobby, not rejoin attempt

## Acceptance Criteria
- [ ] Back to Lobby clears URL to /mp (no ?join=, ?key=)
- [ ] Refreshing after leaving shows lobby (not room rejoin)
- [ ] Direct /mp URL shows lobby
- [ ] Rebuilt with esbuild
