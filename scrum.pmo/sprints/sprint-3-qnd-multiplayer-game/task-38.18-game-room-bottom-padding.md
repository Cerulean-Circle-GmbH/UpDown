[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.18: Game Room Bottom Padding — Content Hidden Under Chat Panel

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Problem
In the game room, bottom padding is insufficient. When scrolling down, game content is hidden under the chat peek bar/messaging panel. Players cannot see all game elements.

## Fix
Increase padding-bottom on the game content area (.mp-game or game board container) to at least the height of the chat peek bar + buffer (e.g. 100px minimum). Ensure scrolling reveals all content above the chat overlay.

## Acceptance Criteria
- [ ] All game content scrollable above chat peek bar
- [ ] No content hidden under messaging panel at any scroll position
- [ ] Padding sufficient on both desktop and mobile
- [ ] Rebuilt with esbuild
- [ ] Tester verifies via Playwright screenshot at max scroll
