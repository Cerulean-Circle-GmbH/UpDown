[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.15: Expert — Game Container White Background + Shadow (match /ts)
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-38150000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
/ts has a white game container with shadow floating on the gradient background. /mp has no container — content sits directly on the gradient. The page gradient background stays as-is.

## Reference: /ts styles.css
```css
.game-container {
  width: 100%;
  max-width: 800px;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

## Fix
Apply same styling to #app in multiplayer.css:
```css
#app {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #333;  /* dark text on white bg */
}
```
Keep existing flex/height/overflow properties. Page gradient background unchanged.

Note: text color needs to change from white to dark since container is now white.

## Acceptance Criteria
1. #app has white semi-transparent background with shadow
2. Page gradient background visible around container edges
3. Text color is dark (readable on white)
4. Buttons still have colored backgrounds (not affected)
5. Matches /ts .game-container visual weight
