[Back to Sprint 3 Planning](./planning.md)

# Task 85: Leaderboard — Own Page + Disk Persistence

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Tron Requirements
1. Leaderboard should be its **own page** (not a panel/overlay in lobby) — with a back button to return to lobby
2. Leaderboard data must be **fundamentally persistent on disk** — survive server restarts

## Changes from Current T82 Implementation

### A. Own Page (not panel)
Current: 🏆 button opens a panel overlay in lobby.
Required: Navigate to a dedicated leaderboard page (e.g. `/leaderboard` or `/mp/leaderboard`). Back button returns to lobby.

- New HTML page or route for leaderboard
- Full-page layout with ranked table, player stats
- Back button → returns to /mp (lobby)
- Accessible from lobby 🏆 button AND from version-click project nav

### B. Disk Persistence
Current: Stats stored in PlayerProfile in data/profiles.json — should already persist.
Verify: Are stats actually written to disk via saveProfiles()? If not, ensure saveProfiles() is called after recordGameResults().

Check: Does the current implementation call saveProfiles() after recording game results? If not, add it.

## Acceptance Criteria
- [ ] Leaderboard is a full page, not an overlay/panel
- [ ] Has a back button to return to lobby
- [ ] 🏆 button in lobby navigates to leaderboard page
- [ ] Data persists across server restarts (kill server, restart, leaderboard still shows data)
- [ ] Verified: play 3 games, restart server, leaderboard still populated
- [ ] Vitest passes
