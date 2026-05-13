[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.17: Cards Side-by-Side Layout

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Previous and current cards stack vertically instead of side-by-side. Should display in a horizontal flex row with an arrow between them, matching /ts layout.

## Fix
Expert reported this was done (cards-row flex container, gap 12px, arrow between, previous dimmed to 0.5 opacity). Needs tester verification that it renders correctly in browser.

## Acceptance Criteria
- [ ] Previous card and current card display side-by-side (horizontal)
- [ ] Arrow → between the two cards
- [ ] Previous card dimmed (opacity)
- [ ] Layout doesn't break on mobile widths
- [ ] Tester verifies via Playwright screenshot
