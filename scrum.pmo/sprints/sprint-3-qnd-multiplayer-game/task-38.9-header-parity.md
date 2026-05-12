[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.9: Expert — MP Header Must Match /ts Header
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-389000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
The /mp header still shows "UpDown\nMultiplayer Card Game" as plain text — very different from /ts which has a compact single-line header with icon buttons (reload ⟲, fullscreen ⛶).

## What /ts Header Looks Like
Read GameUI.ts renderHeader() and styles.css .game-header:
- Single line: "🎴 UpDown" left-aligned
- ⟲ reload button (left, with confirm dialog if game active)  
- ⛶ fullscreen button (right)
- Compact height, dark background, no subtitle
- No "Multiplayer Card Game" subtitle

## What /mp Header Should Become
- Single line: "🎴 UpDown MP" left-aligned (or just "🎴 UpDown")
- ← Leave button (left — replaces ⟲ reload since MP has rooms)
- ⛶ fullscreen button (right — already added in 38.2)
- ⏱ countdown toggle (right, host only — already added in T37)
- Same compact dark styling as /ts
- Remove the large "UpDown\nMultiplayer Card Game" two-line title

## Implementation
1. Read GameUI.ts renderHeader() for the exact HTML structure
2. Read styles.css .game-header for the exact CSS
3. Copy the structure to MultiplayerUI.ts renderHeader()
4. Copy the CSS to multiplayer.css
5. Adapt: ⟲ becomes ← Leave, keep ⛶ and ⏱ toggle
6. Rebuild

## Acceptance Criteria
- [ ] MP header is single-line compact like /ts
- [ ] No "Multiplayer Card Game" subtitle
- [ ] Leave button left, fullscreen + countdown toggle right
- [ ] Same dark background, same height as /ts
- [ ] Visually matches /ts when compared side by side
