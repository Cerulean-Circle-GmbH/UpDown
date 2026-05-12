[Back to Sprint 3 Planning](./planning.md)

# Task 39: Use Case Completeness Review — Player Experience Gaps

## Audit Scope
Reviewed the 55 missing UCs from traceability-matrix.md against actual player experience flows. Focused on: disconnect/reconnect, host transfer, room cleanup, UX feedback.

---

## Critical Gaps Found

### Gap 1: NO RECONNECTION (Priority: P0 — CRITICAL)
**Current:** WebSocket close → `removePlayer()` → player is gone. No way to rejoin same game.
**Client:** `ws.onclose` emits 'disconnected' → nothing. No retry, no reconnect, no state recovery.
**Server:** `ws.on('close')` → removes player from room immediately. During active game, marks `disconnected=true` + `alive=false` — but player can never come BACK.

**Impact:** Phone screen locks for 30 seconds → player loses entire game. WiFi blip → kicked from room. This is the #1 frustration for mobile multiplayer.

**Missing UCs:**
- `UC-DC1: player.disconnect.midGame` — mark disconnected, preserve slot for N seconds
- `UC-DC2: player.reconnect` — rejoin same room+game with same score/state
- `UC-DC3: player.reconnect.timeout` — slot released after 30s if no reconnect

**Implementation needed:**
- Server: keep disconnected player slot for 30s grace period
- Server: RECONNECT message handler — match by clientId or token, restore player state
- Client: auto-retry WebSocket connection on close (exponential backoff, 3 attempts)
- Client: send RECONNECT with stored roomId+playerId on reconnect
- Client: restore game UI state from server RECONNECT_OK response

### Gap 2: HOST TRANSFER DURING ACTIVE GAME (Priority: P1 — HIGH)
**Current:** Host transfer works in `removePlayer()` line 285-288 — picks first non-disconnected player. But:
- No HOST_CHANGED handler on client during active game — UI doesn't update host controls
- If new host has countdown OFF preference, no way to toggle mid-game
- HOST_CHANGED during countdown: new host might not know they're host

**Existing UC:** UC-H1 host.transfer [dd0392cf] — COVERED but only tested for lobby state.

**Missing test:** Host disconnects mid-countdown → new host gets host controls → can force next round.

### Gap 3: CORE GAMEPLAY NOT TESTED (Priority: P0 — CRITICAL for quality)
**12 P0 UCs** have implementation but ZERO tests. These are the fundamental game mechanics:

| UC | What | Why critical |
|----|------|-------------|
| UC-P2 player.guess.down | Correct when next < current | Only 'up' tested, 'down'+'equal' untested |
| UC-P3 player.guess.equal | Correct when next === current | |
| UC-P4 player.guess.correct | Score += 10 + streak | Scoring formula unverified |
| UC-P5 player.guess.wrong | alive = false | Elimination unverified |
| UC-P6 player.guess.timeout | No guess → eliminated | Timeout elimination unverified |
| UC-GE1 game.end.allEliminated | All wrong → GAME_OVER | Game end trigger unverified |
| UC-GE2 game.end.deckEmpty | Deck exhausted → GAME_OVER | |
| UC-GE3 game.end.leaderboard | Sort by score DESC | Leaderboard ordering unverified |

### Gap 4: ROOM CLEANUP EDGE CASES (Priority: P2 — MEDIUM)
**Current:** Empty user rooms cleaned after 60s. Preset rooms auto-recreate. But:
- Room with only disconnected players (all `disconnected=true`) is never cleaned — `players.size > 0` keeps it alive forever
- Room in 'finished' state with 1 idle player — 60s timer from `endGame()` conflicts with player still being connected
- `cleanupEmptyRooms()` exists but unclear when it's called

**Missing UC:** `UC-RM1: room.cleanup.disconnectedOnly` — room with only disconnected/ghost players should be cleaned

### Gap 5: UX LOADING/ERROR STATES (Priority: P2 — MEDIUM)
**Missing feedback for:**
- Create room button → no loading indicator while server processes
- Join room → no feedback if room disappears between list and join click
- Start game → no visual confirmation that START_GAME was sent (button just disables)
- WebSocket disconnect → no user-visible notification ("Connection lost, reconnecting...")
- Server error → no error toast/banner

---

## Top 5 Prioritized

| Rank | Gap | UCs | Effort | Impact |
|------|-----|-----|--------|--------|
| **1** | Reconnection | 3 new UCs (DC1-DC3) | LARGE (2-3h) | #1 player frustration on mobile |
| **2** | Core gameplay tests | 8 existing UCs (P2-P6, GE1-GE3) | MEDIUM (2h) | Zero confidence in scoring/elimination |
| **3** | Host transfer mid-game | 1 existing UC (H1) needs test expansion | SMALL (30min) | Host disconnect breaks game for all |
| **4** | Disconnect notification UX | 1 new UC | SMALL (30min) | Player doesn't know they're disconnected |
| **5** | Room ghost cleanup | 1 new UC | SMALL (15min) | Memory leak on server |

## Recommendation

**Sprint 3 remaining:** Focus on #2 (core gameplay tests) — implementation exists, just needs vitest coverage. This is pure tester work, unblocks CMM4 quality confidence.

**Sprint 4 candidates:** #1 (reconnection) is the biggest player experience improvement but needs both server and client work. Design it now, implement next sprint.

---

**Architect:** ud-architect @ upDownTeam:0.1
**Source:** traceability-matrix.md, GameRoom.ts, server.ts, WebSocketClient.ts
