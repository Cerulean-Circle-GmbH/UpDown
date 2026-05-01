# Additional TRON Specifications — UpDown Multiplayer

**Added:** 2026-05-01
**Source:** Tron directives during Sprint 3

## 1. Lobby-First Experience

Users land in a lobby with **pre-existing rooms already waiting**. The lobby is NOT empty on first visit.

### Pre-created Rooms (always available)
The server auto-creates these rooms on startup and recreates them after each game ends:

| Room Name | Min Players | Description |
|-----------|-------------|-------------|
| Quick Match (2) | 2 | Fast 1v1 game |
| Triple Threat (3) | 3 | 3-player game |
| Squad Game (4) | 4 | 4-player team |
| Full Table (5) | 5 | Standard game |
| Party Mode (10) | 10 | Maximum players |

### User Flow
1. User opens `/mp` → sees lobby with pre-created rooms + any user-created rooms
2. Each room shows: name, player count / max players, status (waiting/in-game)
3. User clicks "Join" on any room → enters room, sees other waiting players
4. Game auto-starts when minimum player count is reached
5. Users can ALSO create custom rooms (existing feature stays)

### Direct Join Links
Each room has a shareable URL: `/mp?join=ROOM_ID&name=PlayerName`
- Clicking this link joins the room directly (skips lobby browse)
- If room is full, show error and redirect to lobby

## 2. Mobile-First Design

- Minimum supported width: 320px (iPhone 4/SE)
- Primary target: 375px (iPhone 15)
- All elements must fit without horizontal scroll
- Cards and buttons must be thumb-reachable
- PWA installable on iOS and Android

## 3. Multi-Player URL Testing

Support `?name=` query parameter for player name:
- `/mp?name=Alice` — sets player name to "Alice"
- Overrides localStorage name
- Enables testing multiple players in separate tabs

## 4. Quality Requirements

- Every feature must be tester-verified IN BROWSER (not just WebSocket protocol)
- E2E automated test suite must cover all game use cases
- Server must handle player disconnect gracefully (eliminate, transfer host)
- No stale cache issues — base href and cache-control headers must work
