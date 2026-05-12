[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.13: Expert — Leave Button Must Return to Lobby, Not /
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-38130000000001]
[uc:uuid:96f2ecd5]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Bug
Pressing ← Leave in the game room navigates to / (landing page) instead of returning to the /mp lobby. Player loses their WebSocket connection and has to reconnect.

## Correct Behavior
Leave should:
1. Send LEAVE_ROOM to server (keeps WebSocket alive)
2. Re-render the lobby view (LobbyUI) in the same #app container
3. Request fresh room list from server
4. Player stays connected, can join another room immediately

## Implementation
Find the Leave button onClick in MultiplayerUI.ts. It likely does `window.location.href = '/'` or `history.back()`. Replace with: call leaveRoom() on WebSocketClient, then switch view back to LobbyUI.

## Acceptance Criteria
1. Press ← Leave → lobby view appears (not / landing page)
2. WebSocket stays connected (no reconnect)
3. Room list refreshes automatically
4. Player can join another room without page reload
