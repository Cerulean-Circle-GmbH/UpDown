[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.19: Game Room Header — Remove Reload Button

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Game room header shows BOTH a reload button (⟲) and a leave button. It should only have the leave button. The reload button belongs on the lobby and single-player views, not in the game room.

## Root Cause
Header.ts renderHeader() is called from MultiplayerUI.ts with the reload button included, or the reload is hardcoded in the shared header regardless of view context.

## Fix
Check how MultiplayerUI.ts calls renderHeader(). The in-game call should be:
```typescript
renderHeader({
  leftButton: { icon: '←', label: 'Leave', onClick: handleLeave },
  rightButtons: [fullscreen, countdown]  // NO reload
})
```

If reload is hardcoded in Header.ts, make it conditional via the options parameter.

## Acceptance Criteria
- [ ] Game room header shows ONLY leave button (left side)
- [ ] Game room header shows fullscreen + countdown toggle (right side)
- [ ] NO reload button in game room
- [ ] Lobby header still has reload button
- [ ] Single-player (/ts) header still has reload button
- [ ] Rebuilt with esbuild
