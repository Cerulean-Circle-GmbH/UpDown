[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.21: CSS Text Color Regression — Black on Black

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Header/container CSS changes (38.15 white container with color:#333) caused text color regressions in several areas where content sits on dark backgrounds:

1. **Player pane** — text is black on black/dark background (unreadable)
2. **Chat/message pane** — messages are black on dark background (unreadable)
3. **Play Again dialog** — text should be white on dark overlay, showing as dark

## Root Cause
Adding `color: #333` to #app (Task 38.15) changed the inherited text color for ALL child elements. Areas with dark backgrounds (player pane, chat sheet, play-again overlay) now inherit dark text instead of white.

## Fix
Review ALL areas with dark backgrounds and ensure text color is explicitly set to white/light:
- `.player-list` or player pane elements → `color: white`
- `.chat-sheet` / `.chat-messages` → `color: white`
- `.play-again-overlay` or game-over dialog → `color: white`
- Any other dark-background UI that inherits from #app

Do NOT remove `color: #333` from #app — the white container needs dark text. Instead, override in specific dark-background children.

## Acceptance Criteria
- [ ] Player pane text readable (white/light on dark)
- [ ] Chat messages readable (white/light on dark)
- [ ] Play Again dialog text white on overlay
- [ ] All other dark-background areas checked and fixed
- [ ] White container areas still have dark text (#333)
- [ ] Rebuilt with esbuild
- [ ] Tester re-runs Playwright to verify no new regressions
