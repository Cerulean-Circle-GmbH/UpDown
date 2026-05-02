# DRY Violations Audit — QnD Multiplayer (Sprint 3)

**Date:** 2026-05-02
**Auditor:** ud-architect @ upDownTeam:0.1
**Files audited:** 18 TypeScript files (~6,714 lines)

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 1 | Message type strings — 29+ hardcoded occurrences across 4 files |
| HIGH | 3 | Card rendering (7 locations), Score calculation (4 locations), Special card data (2 catalogs) |
| MEDIUM | 3 | Share logic (3 copies), Keyboard shortcuts (2 copies), Game state init (2 copies) |
| LOW | 2 | Event listener patterns (15+), Player profile display (2 copies) |

## CRITICAL

### V1: WebSocket Message Type Strings (29+ occurrences)

Every message type (`'ROUND_START'`, `'PLAY_CARD'`, `'GAME_OVER'`, etc.) is a hardcoded string in at least 3 places: server.ts switch/case, GameRoom.ts broadcast, and client handler registration.

**Files affected:** WebSocketClient.ts, LobbyUI.ts, MultiplayerUI.ts, server.ts, GameRoom.ts
**Risk:** Rename a message type → silent breakage (no compiler error on string mismatch)

**Fix:** Create `shared/MessageTypes.ts`:
```typescript
export const MSG = {
  ROUND_START: 'ROUND_START',
  PLAY_CARD: 'PLAY_CARD',
  GAME_OVER: 'GAME_OVER',
  // ... all 20+ types
} as const;
```
Import on both server and client. Compiler catches mismatches.

## HIGH

### V2: Card Rendering / Display (7 locations)

Suit symbol mapping (`hearts → ♥`) and color logic (`hearts|diamonds → red`) duplicated in:
1. MultiplayerUI.ts `renderCard()` (line 437)
2. MultiplayerUI.ts `cardHtml()` (line 472) — DUPLICATE OF ABOVE in same file
3. game-card.ts Lit render
4. GameUI.ts `renderCard()`
5. Card.ts `getColor()`
6. GameRoom.ts deck creation
7. SpecialCards.ts card formatting

**Fix:** Single `CardUtils.ts` with `suitSymbol()`, `cardColor()`, `cardToHtml()`.

### V3: Score Calculation (4 locations)

Scoring formula (`10 + streak` for correct, `streak = 0` for wrong) in:
1. GameModel.ts (single-player)
2. GameRoom.ts resolveRound (multiplayer)
3. GameRoom.ts endGame diamond rewards
4. MultiplayerUI.ts display formatting

**Fix:** `ScoreCalculator.ts` shared between client GameModel and server GameRoom.

### V4: Special Card Data (2 catalogs)

Full card definitions in SpecialCards.ts (10 cards with descriptions, levels, emojis). Partial duplicate in MultiplayerUI.ts (11 entries with emoji + short name only).

**Fix:** Import `SPECIAL_CARDS` from SpecialCards.ts everywhere. Client can import the shared type. Or extract a `shared/SpecialCardInfo.ts` that both import.

## MEDIUM

### V5: Share / Clipboard Logic (3 copies)

Identical pattern in LobbyUI.ts (lines 182-203), MultiplayerUI.ts (lines 197-210), MultiplayerUI.ts (lines 339-352):
```
const url = `${base}/mp?join=${roomId}`;
if (navigator.share) { await navigator.share({...}); }
else { await navigator.clipboard.writeText(url); }
btn.textContent = '✅'; setTimeout(reset, 1500);
```

**Fix:** `ShareUtil.shareRoomLink(roomId, buttonElement)`.

### V6: Keyboard Shortcut Handling (2 copies)

U/D key handling in GameUI.ts (lines 82-100) and game-board.ts (lines 864-898). Both register `document.addEventListener('keydown', ...)` with same U=start, D=stop logic.

**Fix:** `KeyboardController.ts` with configurable bindings.

### V7: Game State Initialization (2 copies)

GameModel.ts `startNewGame()` and GameRoom.ts `startGame()` both reset deck, round, score, streak — but with inconsistent initial values (round 1 vs round 0).

**Fix:** Shared `GameConfig` with initial values.

## LOW

### V8: Event Listener Boilerplate (15+ instances)

`document.getElementById('x')?.addEventListener('click', () => {...})` pattern repeated 15+ times across LobbyUI.ts and MultiplayerUI.ts.

**Fix:** Helper `bindClick(id, handler)` or migrate to Lit event binding.

### V9: Player Profile Display (2 copies)

Player info rendering in MultiplayerUI.ts `showProfile()` and player-notification.ts `handlePlayerJoined()`.

**Fix:** Shared `PlayerCard` Lit component.

## Recommended Refactoring Order

| Phase | What | Files Created | Effort |
|-------|------|--------------|--------|
| 1 | `shared/MessageTypes.ts` | 1 new, 5 modified | 30 min |
| 2 | `shared/CardUtils.ts` | 1 new, 4 modified | 45 min |
| 3 | `shared/ScoreCalculator.ts` | 1 new, 3 modified | 30 min |
| 4 | Import SpecialCards everywhere | 0 new, 1 modified | 15 min |
| 5 | `shared/ShareUtil.ts` | 1 new, 2 modified | 20 min |
| 6 | `shared/KeyboardController.ts` | 1 new, 2 modified | 20 min |
| **Total** | | 5 new, 17 modified | ~2.5h |
