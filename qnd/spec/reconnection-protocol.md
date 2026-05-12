# UpDown QnD — Reconnection Protocol Specification

**Author:** ud-architect @ upDownTeam:0.1
**Date:** 2026-05-12
**Task:** 39.1
**UCs:** UC-DC1 (disconnect.midGame), UC-DC2 (reconnect), UC-DC3 (reconnect.timeout)

---

## Problem

Current: WebSocket close → player permanently removed. No recovery possible.
- Phone screen locks 30s → kicked from game
- WiFi switches (cell↔wifi) → connection drops → game lost
- Browser tab suspends on mobile → WebSocket closes → player gone

ClientId is `${ip}-${Date.now()}` — not stable across reconnections. New WebSocket = new clientId = new identity.

---

## Protocol Design

### 1. Reconnect Token

**On first connect**, server generates a stable `reconnectToken` (UUID) and sends it in the `welcome` message. Client stores it in `sessionStorage`.

```
Server → Client (welcome):
{
  type: 'welcome',
  clientId: '192.168.1.5-1715500000',
  reconnectToken: 'a7f3b2c1-....',     ← NEW
  onlineCount: 5,
  players: [...]
}
```

```
Client stores:
sessionStorage.setItem('updown-reconnect-token', token)
sessionStorage.setItem('updown-reconnect-room', roomId)   // set on ROOM_JOINED
sessionStorage.setItem('updown-reconnect-name', playerName)
```

**Why sessionStorage, not localStorage:** Token expires when tab closes. No stale tokens across sessions.

### 2. Grace Period (Server)

When a player's WebSocket closes and they're in a room:

```
CURRENT:
  ws.on('close') → removePlayer(id)  // gone forever

NEW:
  ws.on('close') → if player in room:
    player.disconnected = true
    player.disconnectTime = Date.now()
    player.ws = null                    // clear dead socket
    store reconnectToken → playerId mapping in room
    broadcast PLAYER_DISCONNECTED to room
    start 30s grace timer for this player
    
  grace timer fires (30s):
    if still disconnected → removePlayer(id) permanently
    broadcast PLAYER_TIMEOUT to room
```

**During grace period:**
- Player's slot is reserved (counts toward maxPlayers)
- Player marked `disconnected=true`, `alive=false` in active game
- Other players see "PlayerName disconnected" status
- Game continues — disconnected player auto-loses current round (guess=null → eliminated)
- Player's score/streak/inventory preserved for reconnection

### 3. RECONNECT Message (Client → Server)

When client detects WebSocket close, it auto-retries:

```
Client reconnection flow:
  ws.onclose fires
  → show "Connection lost — reconnecting..." banner
  → attempt 1: wait 1s, new WebSocket
  → attempt 2: wait 3s, new WebSocket
  → attempt 3: wait 5s, new WebSocket
  → if all fail: show "Connection lost. Tap to retry." button
  
  On new WebSocket open:
  → send RECONNECT message (instead of waiting for welcome to join room)
```

```
Client → Server (RECONNECT):
{
  type: 'RECONNECT',
  reconnectToken: 'a7f3b2c1-....',
  roomId: 'room-abc123',
  playerName: 'Marcel'
}
```

### 4. Server RECONNECT Handler

```
Server receives RECONNECT:
  1. Look up reconnectToken in room's grace period map
  2. If found AND within 30s grace period:
     → cancel grace timer
     → replace player.ws with new WebSocket
     → player.disconnected = false
     → player.alive = (was alive before disconnect? restore)
     → assign new clientId but keep same player slot
     → send RECONNECT_OK with full state snapshot
     → broadcast PLAYER_RECONNECTED to room
  3. If not found OR expired:
     → send RECONNECT_FAILED
     → client falls back to normal lobby flow (fresh welcome)
```

### 5. RECONNECT_OK — State Snapshot (Server → Client)

The reconnecting client needs enough data to rebuild the UI without missing a beat:

```
Server → Client (RECONNECT_OK):
{
  type: 'RECONNECT_OK',
  clientId: '192.168.1.5-1715500030',    // new clientId
  reconnectToken: 'a7f3b2c1-....',       // same token (still valid)
  room: {
    id, name, hostId, state, round,
    playerCount, maxPlayers, isPrivate,
    countdownEnabled
  },
  players: [
    { id, name, avatarUrl, score, alive, disconnected }
  ],
  gameState: {                            // null if room in 'waiting'
    currentCard: { suit, value },
    previousCard: { suit, value },
    countdown: 7,                         // seconds remaining
    cardsLeft: 34,
    inventory: ['protective_shell', ...],
    frozen: false,
    myGuess: null,                        // did I already guess this round?
    alivePlayers: ['id1', 'id2']
  },
  chatHistory: [
    { sender, senderId, text, timestamp }
  ]
}
```

**Key:** `gameState` is only sent if room state is `countdown`, `revealing`, or `exchange`. If `waiting` or `finished`, client just renders lobby/gameover view.

### 6. Broadcasts to Other Players

```
Server → Room (PLAYER_DISCONNECTED):
{
  type: 'PLAYER_DISCONNECTED',
  playerId: 'abc123',
  playerName: 'Marcel',
  graceSeconds: 30
}

Server → Room (PLAYER_RECONNECTED):
{
  type: 'PLAYER_RECONNECTED',
  playerId: 'abc123',
  newClientId: '192.168.1.5-1715500030',
  playerName: 'Marcel'
}

Server → Room (PLAYER_TIMEOUT):
{
  type: 'PLAYER_TIMEOUT',
  playerId: 'abc123',
  playerName: 'Marcel'
}
```

### 7. Client UI States

```
Connected (normal):
  → game UI as-is

Disconnected (reconnecting):
  → semi-transparent overlay with "Connection lost — reconnecting..."
  → spinner animation
  → game UI frozen underneath (visible but not interactive)
  → attempt counter: "Attempt 1/3..."

Reconnected:
  → overlay fades out (0.5s)
  → game UI restores from RECONNECT_OK state
  → toast: "Reconnected!" (2s)
  → if round changed during disconnect, show catch-up animation

Reconnect failed:
  → overlay shows "Connection lost. Return to lobby?"
  → button: "Return to Lobby" → clear sessionStorage, show lobby
```

### 8. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Reconnect during countdown | Restore UI, player can still guess if time remains |
| Reconnect during revealing | Show ROUND_RESULT that was broadcast (missed) |
| Reconnect during exchange | Show exchange view, next round coming |
| Reconnect after game ended | Show GAME_OVER leaderboard |
| Reconnect to finished room (after 60s cleanup) | RECONNECT_FAILED → lobby |
| Two reconnects with same token | First wins, second gets RECONNECT_FAILED |
| Host disconnects + reconnects | Remains host (hostId unchanged) |
| Host disconnects + grace expires | Host transfers to next player (existing logic) |
| All players disconnect | Grace timers run, if all expire → room cleaned |
| Reconnect with wrong roomId | RECONNECT_FAILED (token valid but wrong room) |

### 9. Message Summary

| Message | Direction | When |
|---------|-----------|------|
| `welcome` + `reconnectToken` | Server → Client | New connection |
| `RECONNECT` | Client → Server | Auto-retry after disconnect |
| `RECONNECT_OK` | Server → Client | Token valid, state restored |
| `RECONNECT_FAILED` | Server → Client | Token expired/invalid |
| `PLAYER_DISCONNECTED` | Server → Room | Player's WS closed |
| `PLAYER_RECONNECTED` | Server → Room | Player returned |
| `PLAYER_TIMEOUT` | Server → Room | Grace period expired |

### 10. Data Structures

```typescript
// Server-side: add to GameRoom
interface DisconnectedSlot {
  playerId: string;
  reconnectToken: string;
  disconnectTime: number;
  graceTimer: NodeJS.Timeout;
  wasAlive: boolean;            // preserve alive state for restore
}

// GameRoom additions:
private disconnectedSlots: Map<string, DisconnectedSlot> = new Map();
private reconnectTokenToPlayer: Map<string, string> = new Map();  // token → playerId

// Server-side: add to server.ts wsClients
interface WebSocketClient {
  ws: WebSocket;
  id: string;
  ip: string;
  connectedAt: number;
  avatarUrl: string;
  reconnectToken: string;       // NEW
}
```

### 11. Implementation Subtasks

| # | Task | File | Lines |
|---|------|------|-------|
| 39.1a | Add reconnectToken to welcome message | server.ts | ~5 |
| 39.1b | Client stores token in sessionStorage | WebSocketClient.ts | ~10 |
| 39.1c | Grace period on disconnect (30s) | GameRoom.ts | ~30 |
| 39.1d | RECONNECT handler on server | server.ts | ~40 |
| 39.1e | RECONNECT_OK state snapshot builder | GameRoom.ts | ~30 |
| 39.1f | Client auto-retry (3 attempts, backoff) | WebSocketClient.ts | ~40 |
| 39.1g | Client RECONNECT message + state restore | MultiplayerUI.ts | ~30 |
| 39.1h | Disconnect/reconnect UI overlay | multiplayer.css + MultiplayerUI.ts | ~40 |
| 39.1i | PLAYER_DISCONNECTED/RECONNECTED broadcasts | GameRoom.ts | ~15 |
| **Total** | | | ~240 lines |

---

**Key design decisions:**
- **sessionStorage** not localStorage — token dies with tab, no stale sessions
- **30s grace period** — long enough for WiFi switch, short enough to not block room
- **Same player slot** — reconnected player keeps same score/position, no re-add
- **Token-based** not IP-based — IP changes on cell↔wifi switch
- **Existing PLAYER_DISCONNECTED message** already exists (line 270 GameRoom.ts) — extend it with graceSeconds field
