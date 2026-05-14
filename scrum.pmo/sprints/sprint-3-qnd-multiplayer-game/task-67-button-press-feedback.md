[Back to Sprint 3 Planning](./planning.md)

# Task 67: Button Press/Release Visual Feedback + Double-Press Protection

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirement (Tron)
All buttons need:
1. Visual press/release feedback (active state on touch/click)
2. Wait-until-executed state (disabled + spinner/dimmed while action processes)
3. Double-press protection (prevent accidental multiple clicks)

## Affected Buttons
- Guess buttons (Up/Down/Even) — game room
- Start Game — room lobby
- Enforce Result / Next Round — host controls
- Leave — game header
- Create Room / Join Room — lobby
- Add Bot — room setup
- Play Again — game over
- Send (chat) — chat input
- Share/Invite — lobby + game
- Remove room — lobby
- Profile Save — profile editor

## Implementation
1. CSS `:active` state — visual press (scale down, darken)
2. On click: immediately disable button + add `.loading` class (opacity 0.6 + cursor: wait)
3. After server response or action complete: re-enable button + remove `.loading`
4. For guess buttons: disable after play (already done via hasPlayed) but add visual feedback
5. Shared pattern: `disableWhileExecuting(button, asyncAction)` utility

## Acceptance Criteria
- [x] All buttons show visual press state on touch/click
- [x] Buttons disabled during async action (no double-press)
- [x] Loading/wait visual during processing
- [x] Buttons re-enable after action completes
- [x] Works on both desktop (click) and mobile (touch)
- [x] Rebuilt with esbuild
- [x] withGuard() utility applied to 22 buttons (9 LobbyUI + 13 MultiplayerUI)

## Why Web Components Would Optimize This (Future Sprint)

The current QnD approach uses `withGuard()` — a wrapper function manually applied to each button's click handler across 22 locations. This works but has structural weaknesses:

### Current Problems (innerHTML approach)
1. **Manual per-button wiring** — every button needs explicit `withGuard()` wrapping. Miss one → double-press bug returns. 22 locations to maintain.
2. **Lost on re-render** — `render()` replaces `innerHTML`, destroying all event handlers. They must be re-attached after every render. Source of the T56 handler stacking bugs.
3. **No encapsulation** — button state (loading, disabled, guard active) is managed externally via DOM classes. Any code can bypass the guard by directly manipulating the button.
4. **Duplicated CSS** — `:active`, `.loading`, `.btn-guarded` styles repeated across multiplayer.css. No scoping.

### How Web Components (Lit) Solve This
1. **`<guarded-button>` component** — encapsulates press/release/loading/guard behavior in ONE reusable component. Apply once, use everywhere. Zero manual wiring.
   ```html
   <guarded-button @click=${this.handleJoin} label="Join Room"></guarded-button>
   ```
2. **Reactive state** — Lit's `@state()` decorator handles disabled/loading transitions declaratively. No manual DOM class manipulation.
   ```typescript
   @state() private loading = false;
   render() { return html`<button ?disabled=${this.loading} ...>`; }
   ```
3. **Shadow DOM scoping** — button styles encapsulated per component. No CSS leaks, no specificity wars.
4. **No handler stacking** — Lit manages event listeners declaratively via `@click`. Re-render updates bindings, never stacks them.
5. **Lifecycle hooks** — `connectedCallback()` / `disconnectedCallback()` properly manage setup/teardown. No manual cleanup needed.

### Migration Path (Sprint 4+)
- Create `<guarded-button>` Lit component with built-in guard, loading state, press animation
- Replace all 22 `withGuard()` button locations with `<guarded-button>`
- Delete `withGuard()` utility and manual CSS classes
- Estimated: ~100 lines for component, ~-200 lines removed from LobbyUI/MultiplayerUI
