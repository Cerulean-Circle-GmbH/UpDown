[Back to Sprint 3 Planning](./planning.md)

# Task 83: Host Eliminated Early — Game Ends Prematurely
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-830000000001]

## Status
- [x] Planned
- [x] Architect Analysis
- [x] In Progress
- [ ] QA Review
- [x] Done

## Bug Report (Tron)
When the host loses early and other players are still alive:
- Play Again dialogue appears immediately for the host
- Game appears to end prematurely for everyone
- Other players should continue playing until they all fail

## Root Cause Analysis (Architect — 2026-05-14)

### What triggers GAME_OVER?
`endGame()` (GameRoom.ts:591) fires ONLY when:
- `alivePlayers.length === 0` (line 573) — all players eliminated
- `gmHand.length === 0 && deck.length === 0` (line 573) — deck exhausted

Host elimination does NOT trigger endGame(). The server correctly continues the game.

### The actual bug: TWO ISSUES

#### Issue 1: Countdown OFF + Host Eliminated = Confusing UI

When countdown is OFF and host is eliminated:

**Server (CORRECT):** Line 578 checks `aliveHumans`. If host was the only human → `aliveHumans.length === 0` → auto-advances without host input (line 580-581). If other humans alive → stays in `revealing` waiting for host button press (line 583). Both paths work correctly.

**Client (WRONG UX):** Line 493-495: eliminated host with countdown OFF sees "💀 Eliminated — you still control the game" + "Enforce Result ▶" button. This appears EVERY round even when:
- The server has already auto-advanced (bots-only case)
- The button press might race with server's auto-advance

Tron sees the eliminated host with persistent "Enforce Result" button and interprets it as "game ended" because the host can't play cards anymore and just sees buttons.

#### Issue 2: Countdown OFF should auto-enable on host elimination

The expected behavior states: "If countdown was OFF → automatically toggle to ON so host interaction is not needed for remaining rounds." Currently this does NOT happen. The server keeps `countdownEnabled = false` after host elimination, which means:

- **Host + bots only:** Server auto-advances (bots handle it) — works but host UI is confusing
- **Host + other humans:** Server waits for host button press (line 583) — works but host is dead and must keep pressing buttons for others to continue, which is bad UX
- **Host + humans + bots:** Same as above — dead host must press buttons

### What SHOULD happen

When host is eliminated and countdown is OFF:
1. Server: `countdownEnabled = true` — auto-enable countdown
2. Server: broadcast `COUNTDOWN_SETTING` to inform all clients
3. Remaining rounds run on the 10-second timer automatically
4. Eliminated host sees spectator view (rounds progressing, no buttons)
5. Game ends naturally when all players eliminated or deck empty

### Files to modify

| File | Change | Lines |
|------|--------|-------|
| **GameRoom.ts** | In `resolveRound()` after line 536 (`player.alive = res.alive`): check if eliminated player was host AND countdownEnabled is false → set `countdownEnabled = true`, broadcast COUNTDOWN_SETTING | ~8 |
| **MultiplayerUI.ts** | Line 493-495: eliminated host should show spectator view, NOT "Enforce Result" button. Remove the special `eliminated && isHost && !countdownEnabled` branch — once countdown auto-enables, this case doesn't arise | ~3 (delete branch) |

### Regression risk

LOW. The auto-enable only fires when:
- A player is eliminated (not just alive=false from disconnect)
- That player is the host
- Countdown was OFF

Normal games with countdown ON are unaffected. Games where host survives are unaffected.

**Edge case to test:** Host toggles countdown OFF, gets eliminated, countdown auto-enables. Next Play Again → room resets → host should be able to toggle countdown OFF again. `resetForReplay()` doesn't touch `countdownEnabled` — it persists. The auto-enable from elimination should be overridable in the next game's lobby.

## Acceptance Criteria
1. Host eliminated → countdown auto-enables if it was OFF
2. Host eliminated → sees spectator view (watching remaining players), NO host control buttons
3. Other players continue rounds with 10-second countdown (auto-enabled)
4. Game ends only when ALL players eliminated or deck empty
5. Play Again dialogue appears for everyone at actual game end
6. No regression: host-only games (host + bots) still end correctly
7. After Play Again, host can toggle countdown OFF again in lobby

## Architect Review
- [x] endGame() triggers verified: all-eliminated OR deck-empty only
- [x] Host elimination does NOT trigger endGame — correct
- [x] Root cause: countdown OFF stays OFF after host elimination, causing UI confusion
- [x] Fix: auto-enable countdown on host elimination, ~11 lines across 2 files
- [x] Regression risk assessed: LOW, edge case documented
