[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.12: Expert — Responsive Layout Parity: /mp Must Use /ts Layout Pattern
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-38120000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
/mp has an ugly scrollbar on the right side. The layout uses overflow-y:auto causing content to scroll instead of fitting the viewport. /ts solved this correctly — NO scrollbar, content fits via flex layout.

## Root Cause
multiplayer.css uses a DIFFERENT layout approach than styles.css:

### /ts (CORRECT — no scrollbar):
```css
body { height: 100dvh; overflow: hidden; display: flex; justify-content: center; }
.game-container { max-width: 800px; height: 100%; overflow: hidden; display: flex; flex-direction: column; }
```
- Body is exactly viewport height, no scroll
- Container is flex column, content fills available space
- Cards/buttons sized to FIT, not overflow

### /mp (BROKEN — ugly scrollbar):
```css
body { min-height: 100dvh; overflow-x: hidden; }
#app { max-width: 500px; min-height: 100dvh; overflow-y: auto; }
```
- Body has MIN-height (can grow beyond viewport)
- #app scrolls with overflow-y: auto (ugly scrollbar)
- Content overflows instead of fitting

## Fix: Copy /ts Pattern
Expert MUST read styles.css body + .game-container CSS and replicate in multiplayer.css:

### Step 1: Fix body
```css
body {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;          /* NOT overflow-x: hidden */
  display: flex;
  justify-content: center;
  align-items: stretch;      /* NOT center — stretch fills height */
}
```

### Step 2: Fix #app
```css
#app {
  max-width: 500px;
  width: 100%;
  height: 100%;              /* NOT min-height: 100dvh */
  overflow: hidden;          /* NOT overflow-y: auto */
  display: flex;
  flex-direction: column;
}
```

### Step 3: Fix .lobby and .mp-game
```css
.lobby {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;          /* ONLY the content area scrolls, not the whole page */
  gap: 12px;
}
.mp-game {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;          /* Game view should NEVER scroll */
}
```

### Step 4: Remove all min-height: 100dvh from non-body elements
These force content taller than viewport → scrollbar.

### Step 5: Check all @media queries
/ts has responsive breakpoints at 768px, 480px, and landscape. /mp should match.

## Acceptance Criteria
1. NO visible scrollbar on /mp lobby (portrait phone)
2. NO visible scrollbar on /mp game room (portrait phone)  
3. Lobby content scrolls INSIDE the container if rooms overflow (internal scroll only)
4. Game view NEVER scrolls — cards/buttons fit viewport
5. Header stays fixed at top (not scrolling away)
6. Chat pane slides up over game (not pushing content down)
7. Works on 320px width (iPhone SE)
8. Works on 768px width (tablet)
9. Landscape mode doesn't overflow
10. Compare /ts and /mp side by side — same visual weight

## Architect Review
- [ ] Layout pattern matches /ts (body height:100dvh overflow:hidden)
- [ ] No ugly window-level scrollbar
- [ ] Internal scroll only where needed (room list)
