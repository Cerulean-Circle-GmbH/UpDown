[Back to Sprint 3 Planning](./planning.md)

# Task 35: Room Replay — Same Group Plays Multiple Games
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-350000000001]
[uc:uuid:ea33c5b7]

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Traceability
  - up
    - [uc:uuid:ea33c5b7] UC-GE5: game.end.playAgain
    - Architect analysis: qnd/spec/room-lifecycle-state.puml, qnd/spec/room-replay-usecase.puml
  - down
    - [Task 35.5: Tester — GUI replay verification](./task-35.5-tester-gui-replay-verification.md)

## Use Case Reference
- **UC:** UC-GE5 game.end.playAgain
- **UC UUID:** ea33c5b7
- **Implementation:** GameRoom.ts resetForReplay(), server.ts PLAY_AGAIN handler, MultiplayerUI.ts ROOM_RESET handler
- **Commits:** 196c19cde (Task 35), d38bab400 (chat fix), 1631abc39 (Task 36 bots)

## Root Causes (from architect analysis)
1. No PLAY_AGAIN server message — client did leaveRoom()+rejoin (wrong)
2. state='finished' was terminal — addPlayer() rejected rejoins
3. No resetForReplay() method — room couldn't return to 'waiting'
4. User rooms auto-deleted after 60s cleanup timer
5. Preset rooms delete+recreate (race condition on 500ms setTimeout)

## Acceptance Criteria
1. Host presses Play Again → room state returns to 'waiting'
2. All players stay connected (no disconnect/reconnect WebSocket)
3. Scores reset to 0, deck freshly shuffled, all players alive=true
4. Chat history preserved across games
5. Host can start new game immediately after replay
6. Non-host sees "Waiting for host to start..."
7. No "game in progress" or "room full" errors on replay
8. Spectators remain and see the new game lobby

## Test File
`qnd/test/vitest/uc-ge5-play-again.test.ts` (to be created)

## Test Structure
```typescript
// @uc:uuid:ea33c5b7
describe('UC-GE5 game.end.playAgain [ea33c5b7]', () => {
  it('AC1: PLAY_AGAIN returns ROOM_RESET with state=waiting', async () => { ... });
  it('AC2: players stay connected — no PLAYER_LEFT events', async () => { ... });
  it('AC3: scores reset, deck fresh, all alive', async () => { ... });
  it('AC4: chat history in ROOM_RESET payload', async () => { ... });
  it('AC5: host can START_GAME after ROOM_RESET', async () => { ... });
  it('AC7: no errors on replay flow', async () => { ... });
  it('AC8: spectators receive ROOM_RESET', async () => { ... });
});
```

## Architect Review
- [x] AC matches room-replay-usecase.puml design
- [x] AC is specific and testable
- [x] Covers all 6 root causes identified in analysis
- [x] Room lifecycle state diagram updated (finished→waiting solid green)
