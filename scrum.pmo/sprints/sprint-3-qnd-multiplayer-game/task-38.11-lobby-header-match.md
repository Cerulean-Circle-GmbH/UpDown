[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.11: Expert — Lobby Header Must Match In-Game Header
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-38110000000001]

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Problem
/mp lobby header looks different from /mp in-game header despite both using shared renderHeader() from components/Header.ts. The lobby has old CSS from .lobby wrapper overriding the shared .app-header styles.

## Root Cause Investigation
1. LobbyUI.ts:97 calls `renderHeader()` with NO options — verify it gets the gradient
2. .lobby CSS class may have padding/margin/background overriding .app-header
3. Old lobby-header styles may still exist in multiplayer.css
4. The lobby-header-slot div is inside .lobby — CSS specificity issue

## Acceptance Criteria
1. Lobby header is VISUALLY IDENTICAL to in-game header (same gradient, height, font)
2. Both use .app-header CSS — no overrides from .lobby wrapper
3. Side-by-side comparison: lobby tab and in-game tab look the same
4. No old lobby-specific header CSS remaining in multiplayer.css
5. Rebuild with esbuild — verify in browser

## Test
Open two browser tabs:
- Tab 1: /mp (lobby view)
- Tab 2: /mp join a room (in-game view)
- Compare headers — must be identical gradient bar
