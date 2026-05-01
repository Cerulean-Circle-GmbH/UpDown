[Back to Sprint 3 Planning](./planning.md)

# Task 1: WebSocket Game Rooms
## Status
- [x] Done

## Deliverable
`qnd/src/ts/server/GameRoom.ts` (380 lines)

## What was built
- GameRoom class: room creation, join/leave, player list, GM card dealing, 10s countdown, round resolution, elimination, scoring, leaderboard
- WebSocket protocol: CREATE_ROOM, JOIN_ROOM, LEAVE_ROOM, LIST_ROOMS, START_GAME, PLAY_CARD, ROUND_START, ROUND_RESULT, COUNTDOWN, GAME_OVER, PLAYER_JOINED, PLAYER_LEFT, HOST_CHANGED
- RoomManager: create/list/join rooms, private rooms with key, cleanup empty rooms
- Integrated into existing server.ts

## Acceptance Criteria
- [x] GameRoom.ts compiles clean
- [x] Server starts without errors
- [x] WS protocol handles all game events
- [ ] Tester: 2 browsers join same room (pending Task 1.4)
