[Back to Sprint 3 Planning](./planning.md)

# Task 9: Test Cases — Multiplayer WebSocket Game Protocol
[task:uuid:e1f2a3b4-c5d6-7890-efab-030000000009]

## Status
- [x] Done

## Test Target
Server: `wss://localhost:3443` (QnD HTTPS server with WebSocket)
Test framework: Node.js with `ws` client library
Location: `qnd/test/`

## WebSocket Message Protocol

Client → Server: `{ type: string, ...payload }`
Server → Client: `{ type: string, ...payload }`

---

## UC1: Connect to Server

### TC1.1: Basic connection
```
SEND:    WebSocket open to wss://localhost:3443
EXPECT:  Connection established (ws.readyState === OPEN)
EXPECT:  Server sends { type: 'WELCOME', playerId: <uuid> }
```

### TC1.2: Multiple concurrent connections
```
SEND:    3 WebSocket connections simultaneously
EXPECT:  Each receives unique playerId
EXPECT:  All 3 connected (readyState === OPEN)
```

### TC1.3: Connection with player name
```
SEND:    { type: 'SET_NAME', name: 'Alice' }
EXPECT:  { type: 'NAME_SET', name: 'Alice', playerId: <id> }
```

---

## UC2: Create Room

### TC2.1: Create public room
```
PRE:     Connected as player with name set
SEND:    { type: 'CREATE_ROOM', name: 'Test Room', maxPlayers: 4 }
EXPECT:  { type: 'ROOM_JOINED', room: { id: <8char>, name: 'Test Room', hostId: <myId>, playerCount: 1, maxPlayers: 4, isPrivate: false, state: 'waiting', round: 0 }, players: [{ id: <myId>, name: 'Alice', ... }] }
```

### TC2.2: Create private room with key
```
SEND:    { type: 'CREATE_ROOM', name: 'Secret Room', maxPlayers: 2, roomKey: 'abc123' }
EXPECT:  room.isPrivate === true
EXPECT:  Room NOT in LIST_ROOMS response for other players
```

### TC2.3: Creator becomes host
```
PRE:     Created room
EXPECT:  room.hostId === myPlayerId
```

---

## UC3: Join Room

### TC3.1: Join public room
```
PRE:     Player A created room, Player B connected
SEND B:  { type: 'JOIN_ROOM', roomId: <roomId> }
EXPECT B: { type: 'ROOM_JOINED', room: { playerCount: 2 }, players: [A, B] }
EXPECT A: { type: 'PLAYER_JOINED', player: { id: B.id, name: 'Bob' }, playerCount: 2 }
```

### TC3.2: Join full room rejected
```
PRE:     Room maxPlayers: 2, already 2 players
SEND C:  { type: 'JOIN_ROOM', roomId: <roomId> }
EXPECT:  { type: 'ERROR', message: 'Room is full' }
```

### TC3.3: Join private room with correct key
```
SEND:    { type: 'JOIN_ROOM', roomId: <roomId>, roomKey: 'abc123' }
EXPECT:  { type: 'ROOM_JOINED', ... }
```

### TC3.4: Join private room with wrong key
```
SEND:    { type: 'JOIN_ROOM', roomId: <roomId>, roomKey: 'wrong' }
EXPECT:  { type: 'ERROR', message: 'Invalid room key' }
```

### TC3.5: Join mid-game during exchange phase
```
PRE:     Game in 'exchange' state
SEND:    { type: 'JOIN_ROOM', roomId: <roomId> }
EXPECT:  { type: 'ROOM_JOINED', ... } (allowed per GameRoom.addPlayer line 76)
```

### TC3.6: Join mid-game during countdown rejected
```
PRE:     Game in 'countdown' state
SEND:    { type: 'JOIN_ROOM', roomId: <roomId> }
EXPECT:  { type: 'ERROR', message: 'Game in progress' }
```

### TC3.7: List available rooms
```
SEND:    { type: 'LIST_ROOMS' }
EXPECT:  { type: 'ROOM_LIST', rooms: [{ id, name, playerCount, maxPlayers, state, round }] }
EXPECT:  Private rooms NOT included
```

---

## UC4: Start Game

### TC4.1: Host starts game
```
PRE:     Player A is host, Player B in room
SEND A:  { type: 'START_GAME' }
EXPECT:  Both receive { type: 'ROUND_START', round: 1, currentCard: { suit, value, numericValue }, previousCard: null, countdown: 10, cardsLeft: <n>, alivePlayers: [A.id, B.id] }
```

### TC4.2: Non-host cannot start game
```
PRE:     Player B is NOT host
SEND B:  { type: 'START_GAME' }
EXPECT:  { type: 'ERROR', message: 'Only host can start' }
```

### TC4.3: Cannot start with 0 players
```
PRE:     Room is empty (should not happen, but edge case)
EXPECT:  startGame() returns without action (line 100: if players.size < 1)
```

### TC4.4: Countdown ticks
```
PRE:     Game started
EXPECT:  Receive { type: 'COUNTDOWN', seconds: 9 } after 1s
EXPECT:  Receive { type: 'COUNTDOWN', seconds: 8 } after 2s
...
EXPECT:  Receive { type: 'COUNTDOWN', seconds: 0 } after 10s
EXPECT:  Then ROUND_RESULT (auto-resolve on timeout)
```

---

## UC5: Play Up/Down/Even Card

### TC5.1: Play 'up' guess
```
PRE:     Round started, countdown active
SEND:    { type: 'PLAY_CARD', guess: 'up' }
EXPECT:  All players receive { type: 'CARD_PLAYED', playerId: <myId>, hasPlayed: true }
```

### TC5.2: Play 'down' guess
```
SEND:    { type: 'PLAY_CARD', guess: 'down' }
EXPECT:  { type: 'CARD_PLAYED', playerId: <myId>, hasPlayed: true }
```

### TC5.3: Play 'equal' guess
```
SEND:    { type: 'PLAY_CARD', guess: 'equal' }
EXPECT:  { type: 'CARD_PLAYED', playerId: <myId>, hasPlayed: true }
```

### TC5.4: All players played — early resolution
```
PRE:     2 alive players, both play guesses
EXPECT:  Countdown timer cancelled
EXPECT:  Immediate ROUND_RESULT (no waiting for remaining seconds)
```

### TC5.5: Dead player cannot play
```
PRE:     Player eliminated in previous round (alive: false)
SEND:    { type: 'PLAY_CARD', guess: 'up' }
EXPECT:  No CARD_PLAYED broadcast (silently ignored, line 179)
```

### TC5.6: Cannot play outside countdown phase
```
PRE:     state === 'revealing' or 'exchange'
SEND:    { type: 'PLAY_CARD', guess: 'up' }
EXPECT:  Ignored (line 179: state !== 'countdown')
```

### TC5.7: Player doesn't play — eliminated on timeout
```
PRE:     Player A plays, Player B does nothing
WAIT:    Countdown reaches 0
EXPECT:  ROUND_RESULT shows B: { guess: null, correct: false, eliminated: true }
```

---

## UC6: Play Special Card

### TC6.1: Play special card with guess
```
SEND:    { type: 'PLAY_CARD', guess: 'up', specialCard: 'protective_shell' }
EXPECT:  { type: 'CARD_PLAYED', playerId: <myId>, hasPlayed: true }
```

**Note:** Special card effects are defined in specs/cards.md but implementation status in GameRoom.ts is:
- `specialCard` field exists on RoomPlayer (line 28)
- Reset each round (line 144)
- **NOT evaluated in resolveRound()** — no effect logic implemented yet

### TC6.2: Verify special card field stored
```
PRE:     Player plays with specialCard
VERIFY:  player.specialCard is stored (server-side check, not directly testable from WS)
```

---

## UC7: Receive Round Result

### TC7.1: Correct guess — score increases
```
PRE:     Current card: 5, next card: 9, player guessed 'up'
EXPECT:  ROUND_RESULT contains { playerId, guess: 'up', correct: true, eliminated: false }
EXPECT:  scores[] shows player score increased by (10 + streak)
```

### TC7.2: Wrong guess — player eliminated
```
PRE:     Current card: 9, next card: 5, player guessed 'up'
EXPECT:  ROUND_RESULT contains { playerId, guess: 'up', correct: false, eliminated: true }
EXPECT:  scores[] shows player alive: false, streak: 0
```

### TC7.3: Equal guess correct
```
PRE:     Current card: 7, next card: 7 (same numericValue)
SEND:    guess: 'equal'
EXPECT:  correct: true
```

### TC7.4: Streak accumulation
```
PRE:     Player correct for 3 consecutive rounds
EXPECT:  Round 1: score += 10+0 = 10, streak = 1
EXPECT:  Round 2: score += 10+1 = 11, streak = 2
EXPECT:  Round 3: score += 10+2 = 12, streak = 3
EXPECT:  Total: 33 points
```

### TC7.5: Round result includes all players
```
PRE:     3 players, 1 eliminated earlier
EXPECT:  results[] has entries for alive players only (eliminated skipped at line 214)
EXPECT:  scores[] includes ALL players (alive and dead)
```

### TC7.6: Next round starts after 3s exchange phase
```
PRE:     ROUND_RESULT received
EXPECT:  After ~3 seconds: new ROUND_START with round: N+1
```

---

## UC8: Game Over with Leaderboard

### TC8.1: All players eliminated
```
PRE:     Last alive player guesses wrong
EXPECT:  ROUND_RESULT with all eliminated
EXPECT:  After ~2s: { type: 'GAME_OVER', leaderboard: [{ rank: 1, playerId, name, score, rounds, streak }, ...] }
```

### TC8.2: Deck exhausted
```
PRE:     GM hand empty and deck empty
EXPECT:  { type: 'GAME_OVER', leaderboard: [...] }
```

### TC8.3: Leaderboard sorted correctly
```
EXPECT:  leaderboard sorted by score DESC, then roundsPlayed DESC
EXPECT:  rank field is 1-indexed (1, 2, 3...)
```

### TC8.4: Room state after game over
```
PRE:     GAME_OVER received
EXPECT:  Room state is 'finished'
EXPECT:  Room still exists (players can see results)
```

---

## Edge Cases (from architect review)

### TC-E1: Player disconnect mid-round (BUG-1)
```
PRE:     Game in countdown, Player B alive
ACTION:  Player B WebSocket closes
EXPECT:  PLAYER_LEFT broadcast to remaining players
KNOWN BUG: Player B vanishes instead of being shown as eliminated in ROUND_RESULT
VERIFY:  After expert fix — B should appear in results as eliminated
```

### TC-E2: Host disconnect — host transfer
```
PRE:     Player A is host, Player B in room
ACTION:  Player A WebSocket closes
EXPECT:  { type: 'PLAYER_LEFT', playerId: A.id }
EXPECT:  { type: 'HOST_CHANGED', hostId: B.id }
```

### TC-E3: All players disconnect
```
PRE:     Game running, all players disconnect
EXPECT:  Room eventually cleaned up (timer stops, room removed)
KNOWN ISSUE: cleanupEmptyRooms() not auto-called — verify after fix
```

### TC-E4: Reconnection (if implemented)
```
PRE:     Player disconnects and reconnects with same playerId
EXPECT:  Currently NOT supported — new connection = new player
NOTE:    Reconnection is a Sprint 4 feature if needed
```

---

## Test Implementation Notes

### Test Setup
```typescript
import WebSocket from 'ws';

const WS_URL = 'wss://localhost:3443';
const WS_OPTIONS = { rejectUnauthorized: false }; // self-signed cert

function connect(): Promise<{ ws: WebSocket, playerId: string }> {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL, WS_OPTIONS);
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'WELCOME') resolve({ ws, playerId: msg.playerId });
    });
  });
}

function waitFor(ws: WebSocket, type: string): Promise<any> {
  return new Promise((resolve) => {
    const handler = (data: any) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === type) { ws.off('message', handler); resolve(msg); }
    };
    ws.on('message', handler);
  });
}
```

### Test Order
Run sequentially — each UC builds on previous state:
1. TC1.x (connect)
2. TC2.x (create room)
3. TC3.x (join room)
4. TC4.x (start game)
5. TC5.x + TC7.x (play cards + results — interleaved)
6. TC8.x (game over)
7. TC-E.x (edge cases — separate test suite)
