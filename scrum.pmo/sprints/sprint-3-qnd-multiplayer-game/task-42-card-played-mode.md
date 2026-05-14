[Back to Sprint 3 Planning](./planning.md)

# Task 42: Card Played Mode — Host Plays Card with Live Updates
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-420000000001]

## Status
- [x] Planned
- [x] Architect Review — **ALREADY IMPLEMENTED** (see below)
- [ ] QA Review (tester verification pending)
- [ ] Done

## Requirement (Tron)
Host plays a card → if countdown OFF: show "Enforce Result" button. If countdown ON: countdown starts. After feedback shown → "Next Round" button. All state changes live-update to other players.

## Architect Review (2026-05-14) — CODE MEASURED, NOT ASSUMED

### Verdict: ALL 6 ACCEPTANCE CRITERIA ARE ALREADY IMPLEMENTED

Evidence from current code (measured):

| AC | Requirement | Code Location | Status |
|----|-------------|---------------|--------|
| AC1 | Host plays card, sees "Enforce Result" when countdown off | MultiplayerUI.ts:491 — `'Enforce Result ▶'` button, guarded by `isHost && !countdownEnabled` | ✅ EXISTS |
| AC2 | Other players see "Waiting for host..." | MultiplayerUI.ts:492 — `'Waiting for host...'` when `!countdownEnabled` and `!isHost` | ✅ EXISTS |
| AC3 | "Enforce Result" reveals round result | GameRoom.ts:402-405 — `forceNextRound()` from state=countdown calls `resolveRound()` which broadcasts ROUND_RESULT | ✅ EXISTS |
| AC4 | "Next Round" button after result feedback | MultiplayerUI.ts:664 — `'Next Round ▶'` button in renderRoundResult(), only when `!countdownEnabled && isHost` | ✅ EXISTS |
| AC5 | All state changes live-update | GameRoom.ts:454 — `CARD_PLAYED` broadcast on every playCard(). MultiplayerUI.ts:84-87 updates ●→✅ per player in real-time | ✅ EXISTS |
| AC6 | Countdown ON still works normally | GameRoom.ts:375-376 — `startCountdown()` called when `countdownEnabled`. MultiplayerUI.ts:566-574 renders countdown timer | ✅ EXISTS |

### Server Architecture (verified — no changes needed)

`forceNextRound()` (GameRoom.ts:402-410) is **polymorphic by state**:
- Called from `state=countdown` → `resolveRound()` → reveals cards, broadcasts ROUND_RESULT
- Called from `state=revealing` → `nextRound()` → starts next round, broadcasts ROUND_START

Both phases send the SAME message `FORCE_NEXT_ROUND`. Server dispatches by current state. Clean design — no new messages needed.

```
Phase 1: Host plays → Enforce Result button → FORCE_NEXT_ROUND → resolveRound()
Phase 2: Result shown → Next Round button → FORCE_NEXT_ROUND → nextRound()
```

### Client Button Sequence (verified — correct labels)

| Phase | State | Host sees | Non-host sees | Button sends |
|-------|-------|-----------|---------------|-------------|
| Playing (not yet guessed) | countdown | Guess buttons (Up/Down/Equal) | Same | PLAY_CARD |
| Played (waiting for others) | countdown | "Enforce Result ▶" (line 491) | "Waiting for host..." | FORCE_NEXT_ROUND |
| Eliminated host | countdown | "Enforce Result ▶" (line 485) | "Eliminated — watching..." | FORCE_NEXT_ROUND |
| Result shown | revealing | "Next Round ▶" (line 664) | "Waiting for host..." | FORCE_NEXT_ROUND |

### Live Player Status (verified — already works)

- Server: `broadcast({ type: MSG.CARD_PLAYED, playerId, hasPlayed: true })` on every `playCard()` (line 454)
- Client: `this.client.on(MSG.CARD_PLAYED, ...)` updates `renderPlayerStatus(playerId, true)` → changes ● to ✅ (line 84-87, 577-579)
- Updates in real-time as each player submits guess

### Regression Risk: NONE

- Countdown ON path unaffected — `startCountdown()` runs independently, `forceNextRound()` has state guards
- `resolveRound()` has re-entry guard (line 467-468: `if (state !== 'countdown') return`)
- `allPlayed` auto-resolve still works (line 456-460) — early resolve cancels countdown timer

### Files Changed: ZERO

No server or client changes needed. Task is already implemented by:
- Task 37 (countdown toggle + forceNextRound)
- Task 38.14 (persistent feedback + Enforce Result button in revealing state)
- Existing CARD_PLAYED broadcast (original implementation)

## Subtasks — Updated Status
- [x] 42.1: Architect — Review complete. Flow fits existing states. **No new states or messages needed.**
- [x] 42.2: Expert — **Already done** by Task 37 (forceNextRound polymorphic handler)
- [x] 42.3: Expert — **Already done** by Tasks 37+38.14 (correct button labels + sequential phases)
- [x] 42.4: Expert — **Already done** (CARD_PLAYED broadcast exists from original impl)
- [ ] 42.5: Tester — Verify the exact flow described above. **Test script:**
  1. Create room, add 1 bot, toggle countdown OFF
  2. Start game → play card → verify "Enforce Result ▶" appears for host
  3. Verify bot's ● changes to ✅ when bot plays (live update)
  4. Press "Enforce Result" → verify round result shown to host
  5. Verify "Next Round ▶" button appears below result
  6. Press "Next Round" → verify next round starts
  7. Repeat with countdown ON → verify countdown timer works, no "Enforce" buttons

## Acceptance Criteria (CHECK baseline for tester)
1. Host plays card, sees "Enforce Result" when countdown OFF
2. Other players see "Waiting for host..." during host decision
3. "Enforce Result" reveals round result to ALL players
4. "Next Round" button appears after result feedback
5. All state changes live-update to non-host players (●→✅)
6. Countdown ON mode still works normally (no regression)

## Architect Review Checkboxes
- [x] Current code READ before speccing — all line numbers verified
- [x] Files to change documented: ZERO (already implemented)
- [x] Regression risk assessed: NONE (state guards, re-entry guard)
- [x] Spec is CHECK baseline — tester can verify against AC 1-6
