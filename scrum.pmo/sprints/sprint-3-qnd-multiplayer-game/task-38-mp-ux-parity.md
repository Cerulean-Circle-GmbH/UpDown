[Back to Sprint 3 Planning](./planning.md)

# Task 38: Multiplayer UX Parity — Port Single-Player Polish to MP

## Goal
Port proven UX features from GameUI.ts (single-player) to MultiplayerUI.ts (multiplayer). The single-player UI has better header controls, keybindings, card visuals, and responsive handling that MP is missing.

## Gap Analysis: Single-Player → Multiplayer

### A. HEADER (Priority: HIGH)
| Feature | Single-Player (GameUI.ts) | Multiplayer (MultiplayerUI.ts) | Gap |
|---------|--------------------------|-------------------------------|-----|
| Reload button | ⟲ icon, left-aligned, confirms if game active | "← Leave" text button | Style inconsistency, no reload |
| Fullscreen toggle | ⛶ icon, double-tap/double-click | **MISSING** | No way to go fullscreen in MP |
| iOS fullscreen hint | Alert with instructions for standalone mode | **MISSING** | iOS users can't fullscreen |

### B. KEYBINDINGS (Priority: HIGH)
| Feature | Single-Player | Multiplayer | Gap |
|---------|--------------|-------------|-----|
| Arrow Up / U key | Guess "Up" | **MISSING** — buttons only | No keyboard play in MP |
| Arrow Down / D key | Guess "Down" | **MISSING** | |
| Arrow Left/Right / E key | Guess "Equal" | **MISSING** | |
| Key hints on buttons | `<kbd>U</kbd>` shown on buttons | **MISSING** | |
| Enter key | Start game | Chat send only | Could also submit guess |

### C. CARD LAYOUT & VISUALS (Priority: MEDIUM)
| Feature | Single-Player | Multiplayer | Gap |
|---------|--------------|-------------|-----|
| Card size | 120×168px (generous) | 65×95px base (cramped) | MP cards too small on tablet |
| "Previous Card" label | Text label above left card | **MISSING** | No card role indication |
| "Current Card" label | Text label above right card | **MISSING** | |
| Previous card darkened | Opacity/filter to push focus to current | **MISSING** — both cards same brightness | Confusing which card matters |
| Card flip animation | flipIn 0.5s rotateY | **MISSING** | Cards just appear, no reveal feel |
| Result animations | bounceIn (correct), shakeIt (wrong) | Background color only | Less satisfying feedback |

### D. RESPONSIVE / SCROLL (Priority: MEDIUM)
| Feature | Single-Player | Multiplayer | Gap |
|---------|--------------|-------------|-----|
| Landscape mode | 3-column grid, vertical buttons | **MISSING** — same layout rotated | Buttons overflow on landscape phones |
| Tiny screen (480px) | Scaled-down everything coherently | Partial — cards scale, buttons don't always | Some overflow on 320px |
| Fullscreen pseudo-class | `:fullscreen` removes border-radius | **MISSING** | |
| overflow: hidden | Prevents all scrolling | Some containers scroll | Accidental scroll during gameplay |

### E. GAME FEEDBACK (Priority: LOW)
| Feature | Single-Player | Multiplayer | Gap |
|---------|--------------|-------------|-----|
| Result message | "Correct! 🎉" / "Wrong! 💥" with animation | Score breakdown card | MP has more info but less punch |
| Streak display | Inline with score, live | In round results only | No live streak during round |
| Sound effects | None | None | Both missing (future) |

## Subtasks

### 38.1: Expert — Add fullscreen toggle to MP header
- Add ⛶ button to `mp-header` right side
- Double-tap/double-click to toggle (same as SP)
- iOS standalone detection + instructions alert
- CSS: `:fullscreen` pseudo-class styles
- **AC:** Double-tap header → fullscreen toggles on/off

### 38.2: Expert — Add keyboard shortcuts for MP gameplay
- Arrow Up or `U` key → guess "Up" (when countdown state, player alive)
- Arrow Down or `D` key → guess "Down"
- Arrow Left/Right or `E` key → guess "Equal"
- Enter key → submit guess OR send chat (context-dependent: if chat focused → chat, else → guess confirmation)
- Show `<kbd>` hints on guess buttons (hidden on touch-only via `@media (hover: hover)`)
- Guard: only when state=countdown, player alive, not already guessed
- **AC:** Press U/D/E during countdown → guess submitted, same as button click

### 38.3: Expert — Add "Previous Card" / "Current Card" labels
- Add labels above each card slot in `mp-table`
- "Previous" above left card, "Current" above right card
- CSS: 0.7rem, opacity 0.6, uppercase, letter-spacing 1px
- **AC:** Labels visible above both cards during gameplay

### 38.4: Expert — Darken previous card for focus
- When current card is revealed, apply opacity/filter to previous card
- CSS: `.mp-card-previous { opacity: 0.5; filter: brightness(0.7); transition: 0.3s; }`
- Only during countdown/revealing states (not in results view)
- **AC:** Previous card visually recedes, current card draws eye

### 38.5: Expert — Add card flip animation
- When new current card is revealed (ROUND_START), apply flipIn animation
- CSS: Same `flipIn` keyframes from styles.css (rotateY 90→0, scale 0.8→1)
- Apply to `.mp-card` element via `.mp-card-flip` class, remove after 0.5s
- **AC:** Card appears with flip animation on each new round

### 38.6: Expert — Add result animations (bounceIn / shakeIt)
- On ROUND_RESULT: if correct → bounceIn on result card, if wrong → shakeIt
- Reuse same keyframes from styles.css
- Apply class for 0.5s then remove
- **AC:** Correct guess bounces, wrong guess shakes — matches SP feel

### 38.7: Expert — Landscape layout for MP
- Add `@media (orientation: landscape) and (max-height: 500px)` styles
- Reflow mp-table and mp-guess-buttons into horizontal grid
- Cards + arrow in center column, buttons in right column (vertical stack)
- Player roster in left column (compact)
- **AC:** Landscape phone shows playable layout without overflow

### 38.8: Tester — Verify all UX improvements
- Test each subtask on: desktop browser, mobile portrait, mobile landscape, tablet
- Verify keybindings don't conflict with chat input focus
- Verify fullscreen works on Chrome, Safari, Firefox
- Verify animations don't cause layout shift
- **AC:** All 7 features work across 4 form factors

## Dependencies
- No server changes needed — all client-side
- CSS changes in multiplayer.css
- JS changes in MultiplayerUI.ts
- Can run in parallel with other Sprint 3 tasks

## Estimated Effort
| Subtask | Lines | Time |
|---------|-------|------|
| 38.1 Fullscreen | ~30 TS + ~15 CSS | 30min |
| 38.2 Keybindings | ~40 TS + ~10 CSS | 45min |
| 38.3 Card labels | ~5 TS + ~10 CSS | 15min |
| 38.4 Darken previous | ~5 TS + ~5 CSS | 10min |
| 38.5 Flip animation | ~10 TS + ~10 CSS | 15min |
| 38.6 Result animations | ~15 TS + ~10 CSS | 20min |
| 38.7 Landscape layout | ~0 TS + ~40 CSS | 30min |
| **Total** | ~105 TS + ~100 CSS | ~3h |

## Not Porting (MP-specific, no SP equivalent needed)
- Chat system (MP only)
- Player roster (MP only)
- Special cards UI (MP only)
- Spectator mode (MP only)
- Host controls (MP only)

---

**Architect:** ud-architect @ upDownTeam:0.1
**Source:** GameUI.ts vs MultiplayerUI.ts comparative analysis
