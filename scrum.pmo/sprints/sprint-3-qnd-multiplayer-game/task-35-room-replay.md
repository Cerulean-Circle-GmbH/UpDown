[Back to Sprint 3 Planning](./planning.md)

# Task 35: Room Replay — Same Group Plays Multiple Games
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-350000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:f1ba3e42] UC-GE5: game.end.playAgain
    - Architect analysis: qnd/spec/room-lifecycle-state.puml, qnd/spec/room-replay-usecase.puml

## Root Causes (from architect analysis)
1. No PLAY_AGAIN server message — client does leaveRoom()+rejoin (wrong)
2. state='finished' is terminal — addPlayer() rejects rejoins
3. No resetForReplay() method — room can't return to 'waiting'
4. User rooms auto-delete after 60s cleanup timer
5. Preset rooms delete+recreate (race condition on 500ms setTimeout)
6. Client leaves WebSocket room unnecessarily

## Correct Design
- Client sends PLAY_AGAIN (stays connected, no leave/rejoin)
- Server: GameRoom.resetForReplay() — state→'waiting', reset scores/deck/alive, KEEP players+chat+host
- Server broadcasts ROOM_RESET to all players+spectators
- All clients re-render lobby view with same player list
- Host starts new game when ready

## Subtasks

### 35.1: Expert — GameRoom.resetForReplay() method
- Add resetForReplay() to GameRoom.ts
- Reset: state→'waiting', round→0, scores→0, alive→true, deck→fresh, specialCards→cleared
- KEEP: players map, chat history, hostId, room name/id
- Cancel any running countdown timers

### 35.2: Expert — PLAY_AGAIN + ROOM_RESET messages
- Add PLAY_AGAIN to MessageTypes.ts
- Add ROOM_RESET to MessageTypes.ts  
- server.ts: handle PLAY_AGAIN → call room.resetForReplay() → broadcast ROOM_RESET
- Only host can trigger PLAY_AGAIN (or any player?)

### 35.3: Expert — Client Play Again fix
- MultiplayerUI.ts renderGameOver(): remove leaveRoom()+rejoin logic
- Send PLAY_AGAIN message instead
- Handle ROOM_RESET: re-render lobby/waiting view with current player list
- Show "Waiting for host to start..." for non-host players

### 35.4: Expert — Fix cleanup timer
- Don't auto-delete rooms in 'finished' state if players still connected
- Only cleanup truly empty rooms (0 players + 0 spectators)

### 35.5: Tester — Verify replay flow end-to-end
- 2 players complete a game → host presses Play Again → both see lobby → host starts new game → full second game plays
- Verify scores reset to 0
- Verify chat history preserved
- Verify spectators stay
- Verify player list unchanged

## Acceptance Criteria
- [ ] Host presses Play Again → room returns to waiting state
- [ ] All players stay connected (no disconnect/reconnect)
- [ ] Scores reset, deck fresh, all players alive
- [ ] Chat history preserved across games
- [ ] Host can start new game immediately
- [ ] Non-host sees "Waiting for host..."
- [ ] No "game in progress" or "room full" errors
- [ ] Spectators remain and see the new game
