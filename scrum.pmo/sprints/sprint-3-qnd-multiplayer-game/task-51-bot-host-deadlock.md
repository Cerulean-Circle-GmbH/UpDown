[Back to Sprint 3 Planning](./planning.md)

# Task 51: BUG — Bot as Host Causes Deadlock

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
If a bot becomes host (e.g. host disconnects, bot is next in line), the game deadlocks. Bots can't press "Enforce Result" or "Next Round" — those are host-only UI buttons that bots don't interact with. With countdown OFF, the game freezes forever.

## Fix
First human player to join should always become host. Host transfer on disconnect should skip bots and go to next human. If no humans remain, auto-resolve rounds (bots play automatically).

## Acceptance Criteria
- [ ] First joining human is always host (not a bot)
- [ ] Host transfer on disconnect skips bots, goes to next human
- [ ] If only bots remain, game auto-resolves (no deadlock)
- [ ] Pre-created rooms with bots: first human joiner becomes host
- [ ] Rebuilt with esbuild
