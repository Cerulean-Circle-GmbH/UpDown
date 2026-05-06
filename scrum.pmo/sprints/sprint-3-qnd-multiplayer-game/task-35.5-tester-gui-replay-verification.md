[Back to Sprint 3 Planning](./planning.md) | [Back to Task 35](./task-35-room-replay.md)

# Task 35.5: Tester — GUI End-to-End Replay Verification
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-355000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Test the FULL GUI flow of room replay in a real browser. Protocol tests verify the server — this task verifies what the USER sees and clicks. Use Playwright or manual browser automation via the tester shell.

## Test Method
Use the tester shell (upDownTeam:0.5) to run a Playwright/puppeteer script OR use two WebSocket connections that simulate the full client flow including UI state transitions.

If no browser automation available: write a detailed WebSocket test that simulates the EXACT client message sequence including ROOM_RESET handling, verifying every server response matches what the UI would render.

## Test Cases

### TC-35.5.1: Full Replay Flow
1. Player A creates room (auto-named "{A}'s Room")
2. Player B joins via room list
3. Player A (host) starts game
4. Both players play rounds until GAME_OVER
5. Player A presses Play Again → sends PLAY_AGAIN
6. **VERIFY:** Both receive ROOM_RESET with state='waiting' and full player list
7. **VERIFY:** Player list includes both A and B (no one dropped)
8. **VERIFY:** Scores are 0 for both players
9. Player A starts second game
10. **VERIFY:** ROUND_START received by both — second game works

### TC-35.5.2: Non-Host Play Again
1. Same setup — game ends
2. Player B (non-host) sends PLAY_AGAIN
3. **VERIFY:** Works — any player can trigger replay (per architect design)

### TC-35.5.3: Spectator Survives Replay
1. Player A + B in room, Player C spectating
2. Game ends → Play Again
3. **VERIFY:** C still receives ROOM_RESET, stays as spectator

### TC-35.5.4: Chat Preserved
1. Send chat messages during game
2. Play Again
3. **VERIFY:** ROOM_RESET includes chatHistory or chat persists in room state

### TC-35.5.5: No Stale Errors
1. After replay, verify no "game in progress" errors
2. After replay, verify no "room full" errors  
3. Verify room appears in ROOM_LIST with state='waiting' and correct player count

### TC-35.5.6: Bot Behavior on Replay
1. Game with 1 human + 1 bot
2. Game ends → Play Again
3. **VERIFY:** Bot is cleared on replay (per resetForReplay design — bots cleared)
4. Host can add new bot before starting next game

## Acceptance Criteria
- [ ] TC-35.5.1: Full replay flow PASS
- [ ] TC-35.5.2: Non-host replay PASS
- [ ] TC-35.5.3: Spectator survives PASS
- [ ] TC-35.5.4: Chat preserved PASS
- [ ] TC-35.5.5: No stale errors PASS
- [ ] TC-35.5.6: Bot cleared on replay PASS
