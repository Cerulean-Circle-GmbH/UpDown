[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.10: DRY Shared Header Component
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-3810000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Header is implemented separately in GameUI.ts, MultiplayerUI.ts, and LobbyUI.ts. Each has its own renderHeader() with duplicated HTML/CSS. Lobby header was NOT updated to match — only the in-game header was changed. DRY violation.

## Correct Design
ONE shared header function/class used by ALL views:

```typescript
// qnd/src/public/ts/components/Header.ts
export function renderHeader(options: {
  title?: string;          // default: '🎴 UpDown'
  leftButton?: { icon: string; label: string; onClick: () => void };  // ← Leave, ⟲ Reload
  rightButtons?: { icon: string; onClick: () => void }[];  // ⛶ fullscreen, ⏱ countdown
}): HTMLElement
```

All views call `renderHeader()` with their specific buttons. ONE CSS class `.app-header` in ONE place.

## Subtasks

### 38.10.1: Expert — Create shared Header component
- Create qnd/src/public/ts/components/Header.ts
- Single renderHeader() function with configurable left/right buttons
- ONE .app-header CSS block (gradient, compact, single-line)
- Export for use by GameUI, LobbyUI, MultiplayerUI

### 38.10.2: Expert — Refactor all 3 views to use shared header
- GameUI.ts: replace renderHeader() with import from Header.ts
- LobbyUI.ts: replace header HTML with renderHeader({ leftButton: none })
- MultiplayerUI.ts: replace renderHeader() with renderHeader({ leftButton: Leave, rightButtons: [fullscreen, countdown] })
- Delete duplicated header CSS from styles.css and multiplayer.css — keep only in Header.ts or a shared CSS file

### 38.10.3: Tester — Verify header consistent across all 3 views
- /ts single-player: header matches design
- /mp lobby: SAME header style (was broken — this fixes it)
- /mp in-game: SAME header with Leave + fullscreen + countdown
- All 3 visually identical gradient bar

## Acceptance Criteria
- [ ] ONE Header.ts file is the single source of truth
- [ ] GameUI, LobbyUI, MultiplayerUI all import from Header.ts
- [ ] No duplicated header HTML in any view
- [ ] No duplicated header CSS in any stylesheet
- [ ] Lobby header matches in-game header style
- [ ] All 3 views show same compact gradient bar
