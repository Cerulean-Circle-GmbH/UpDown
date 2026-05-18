[Back to Sprint 3 Planning](./planning.md)

# Task 91: Button Feedback Review — All Buttons Must Have Press Feedback

## Status
- [x] Planned
- [x] In Progress
- [x] QA Review
- [x] Done

## Tron Requirement
ALL buttons must have onpress feedback — especially Create Room and other action buttons. Buttons should:
1. Show immediate visual feedback on press (scale/darken) — works OFFLINE (CSS only)
2. Stay in "pressed/loading" state until the action executes (server responds)
3. Only return to normal state after completion

This is basic UX — user must always know their press was registered and something is happening.

## Review Scope
Audit EVERY button in:
- LobbyUI.ts — Create Room, Join, Watch, Remove, Edit Profile, Leaderboard, all lobby buttons
- MultiplayerUI.ts — Start Game, Play Card, Special Cards, Invite, Leave, Chat Send, all game buttons
- All HTML pages — Home button, version click, navigation buttons

## Current State (T67)
T67 added `withGuard()` to 22 buttons. But:
- Newer buttons (T78-T90) may not have it
- Create Room specifically called out by Tron
- "Stay pressed until executed" may not be implemented — withGuard prevents double-press but may not show loading state

## DRY Approach (Tron direction)
Instead of manually wiring `withGuard()` per button (22+ locations), implement ONE of:

### Option A: Global CSS `.btn` class
All buttons use `.btn` class → CSS handles `:active` (press), `.loading` (waiting), `[disabled]` (guard). One place to maintain.
```css
.btn { transition: transform 0.1s; }
.btn:active { transform: scale(0.95); opacity: 0.8; }
.btn.loading { opacity: 0.6; pointer-events: none; }
.btn.loading::after { content: '⏳'; }
```

### Option B: Event delegation
One event listener on document/container intercepts ALL button clicks. Adds loading class, calls handler, removes on response. Zero per-button wiring.
```typescript
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.btn');
  if (!btn || btn.classList.contains('loading')) return;
  btn.classList.add('loading');
  // handler resolves → btn.classList.remove('loading')
});
```

### Option C: `<action-button>` Web Component (T67 already suggested this)
Custom element wraps any button with guard + feedback + loading. But may be overkill for QnD.

**Recommend Option A+B combined:** global CSS for visuals + event delegation for guard/loading. Zero per-button code.

## Requirements
1. ONE CSS class (`.btn`) handles all visual feedback — `:active`, `.loading`, `[disabled]`
2. ONE event delegation handler guards all `.btn` clicks — prevents double-press, adds loading state
3. Loading state stays until server response (callback or message handler removes `.loading`)
4. Audit: verify every button uses `.btn` class

## Architect Audit (2026-05-16) — 45 buttons, 8 critical gaps, fix in ~28 lines

**CSS :active:** COMPLETE — global `.btn:active` rule covers all buttons.
**guardClick loading:** BROKEN — actions are sync WS sends, loading class invisible.
**Missing guardClick:** 5 action buttons (Chat send, Leaderboard, Toggle Countdown, Add Friend).
**Zero buttons wait for server response.**

**Recommend:** Fix guardClick with `once()` + responseEvent parameter (~28 lines). Full audit + DRY analysis + code samples in plan file: `/Users/donges/.claude/plans/recursive-swimming-engelbart.md`

Summary tables delivered to PO via otmux.

## Acceptance Criteria
- [x] Architect audits all buttons — 45 listed with feedback status
- [ ] Every button has CSS `:active` press feedback — ✅ already done
- [ ] Create Room stays pressed/loading until ROOM_JOINED response
- [ ] Join Room stays pressed until ROOM_JOINED
- [ ] Start Game stays pressed until ROUND_START
- [ ] No button fires without visual feedback
- [ ] Vitest passes
