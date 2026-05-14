[Back to Sprint 3 Planning](./planning.md)

# Task 71: BUG — Lobby Header Click Doesn't Remove Join Parameters

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review (tester must verify)
- [ ] Done

## Problem (Tron)
Clicking the lobby header (reload/home) doesn't clear ?join= and ?key= URL params. Task 70 fixed the leave path but the header click path is separate.

## Fix
Header click handler (reload button / title click) must also call `history.replaceState({}, '', '/mp')` to clean URL before reloading.

## Acceptance Criteria
- [ ] Clicking lobby header clears ?join= and ?key= from URL
- [ ] Page reloads to clean lobby view
- [ ] Tester verifies via Playwright before reporting
- [ ] Rebuilt with esbuild
