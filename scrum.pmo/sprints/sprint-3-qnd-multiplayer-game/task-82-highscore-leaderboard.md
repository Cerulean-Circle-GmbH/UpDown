[Back to Sprint 3 Planning](./planning.md)

# Task 82: Highscore & Leaderboard from Lobby
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-820000000001]

## Status
- [x] Planned
- [x] Architect Spec
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Architect Spec (2026-05-14)

### Current State (measured)
- `endGame()` (GameRoom.ts:591-611) computes leaderboard in-memory and broadcasts GAME_OVER
- Leaderboard data per game: rank, playerId, name, score, rounds, maxStreak, diamonds
- **Nothing persisted** — no game history, no cumulative stats, no highscores
- Profile system exists (server.ts:105-140) — `data/profiles.json` with token, name, avatar, devices
- Profile has **no game stats fields**

### Data Model — Extend PlayerProfile

Add stats to existing `PlayerProfile` (server.ts:115):

```typescript
interface PlayerProfile {
  // Existing fields unchanged
  token: string;
  name: string;
  avatar: string;
  phone: string;
  url: string;
  devices: DeviceInfo[];
  
  // NEW — cumulative stats
  gamesPlayed: number;       // total games finished
  wins: number;              // times ranked #1
  totalScore: number;        // sum of all game scores
  totalDiamonds: number;     // sum of all diamonds earned
  bestScore: number;         // highest single-game score
  bestStreak: number;        // longest streak across all games
  bestRank: number;          // best rank achieved (1 = won)
  lastPlayed: string;        // ISO timestamp
}
```

Backward compatible: old profiles without stats default to 0.

### Game Result Recording

Add `gameOverCallback` to GameRoom. In server.ts, after GAME_OVER broadcast:

```typescript
function recordGameResult(playerId: string, entry: LeaderboardEntry): void {
  // Reverse lookup: clientId → token (from tokenToClient map)
  const token = [...tokenToClient.entries()].find(([,cid]) => cid === playerId)?.[0];
  if (!token) return; // bot or unlinked player
  const profile = playerProfiles.get(token);
  if (!profile) return;
  
  profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
  profile.totalScore = (profile.totalScore || 0) + entry.score;
  profile.totalDiamonds = (profile.totalDiamonds || 0) + entry.diamonds;
  profile.wins = (profile.wins || 0) + (entry.rank === 1 ? 1 : 0);
  profile.bestScore = Math.max(profile.bestScore || 0, entry.score);
  profile.bestStreak = Math.max(profile.bestStreak || 0, entry.maxStreak);
  profile.bestRank = Math.min(profile.bestRank || 999, entry.rank);
  profile.lastPlayed = new Date().toISOString();
}
// Call for each human player in leaderboard, then saveProfiles() once
```

### Leaderboard Ranking

**Primary:** Total diamonds (descending) — incorporates rank, survival, streaks across all games
**Tiebreaker 1:** Wins (descending)
**Tiebreaker 2:** Best single-game score (descending)
**Tiebreaker 3:** Games played (descending)

### Message Protocol

```typescript
// Client → Server
{ type: 'GET_LEADERBOARD' }

// Server → Client
{ 
  type: 'LEADERBOARD',
  entries: [
    { rank: 1, name: 'Marcel', totalDiamonds: 450, wins: 5,
      gamesPlayed: 12, bestScore: 187, bestStreak: 8, isYou: true }
  ],
  myRank: 1
}
```

Build from playerProfiles Map. Filter: `gamesPlayed > 0`. Exclude bots (no token). Sort by diamonds desc. Add `isYou: true` for requester's entry.

### Storage

Extend existing `data/profiles.json`. No new file. saveProfiles() already handles persistence.

### Client UI

Lobby gets a 🏆 button. Clicking sends GET_LEADERBOARD, renders panel:

```
#1 🥇 Marcel     💎 450  5W  12G
#2 🥈 Player42   💎 320  3W   8G
#3 🥉 Guest      💎 210  2W   6G
#4 → You         💎 180  1W   4G  ← highlighted

Your Stats: 4 games | 1 win | Best: 187 pts | 8🔥 | 💎 180
```

### Subtasks

| # | Task | File(s) | Lines |
|---|------|---------|-------|
| 82.1 | Add stats fields to PlayerProfile | server.ts | ~10 |
| 82.2 | Record game results in endGame callback | server.ts + GameRoom.ts | ~30 |
| 82.3 | GET_LEADERBOARD handler | server.ts | ~25 |
| 82.4 | Client: leaderboard button + panel | LobbyUI.ts | ~70 |
| 82.5 | Update docs | docs/game-rules.md, docs/multiplayer.md | ~30 |
| 82.6 | Tester: verify after 3 games | manual | — |
| **Total** | | | **~165** |

## Acceptance Criteria
1. 🏆 Leaderboard button visible in lobby
2. Shows ranked player list sorted by total diamonds
3. Player's own position highlighted
4. "Your Stats" section: games, wins, best score, best streak, total diamonds
5. Results recorded automatically at endGame() for each human player
6. Persists across server restarts (data/profiles.json)
7. Bots excluded (no playerToken = no profile)
8. Backward compatible (old profiles default stats to 0)
9. docs/game-rules.md updated
10. docs/multiplayer.md updated

## Architect Review
- [x] Current code READ — endGame, PlayerProfile, profiles.json verified
- [x] Extends existing profile system, no new storage
- [x] Ranking by diamonds (incorporates rank + survival + streaks)
- [x] Backward compatible

## QA Finding — Tester FAIL Analysis (Architect)
**Result:** Test setup issue, NOT a code bug.
**Evidence:** data/record-debug.log shows recordGameResults() IS called (4 times). tokenToClient is empty because Playwright fresh context either doesn't send playerToken or closes WS before endGame fires (2s setTimeout).
**Decision:** Code is correct for real browsers. No code fix needed.

### Refinements
- [x] 82.7: Tester — retested with real browser. Confirmed: still fails. Code bug, not test setup.
- [x] 82.8: Expert — root cause: tokenToClient reverse lookup fails because token not stored on RoomPlayer. Fix: store playerToken directly on RoomPlayer at addPlayer() time. recordGameResults reads entry.playerToken — no reverse lookup needed.
- [ ] 82.9: Tester — retest after expert fix. Verify leaderboard populates after 3 games.
- [x] Bots excluded
