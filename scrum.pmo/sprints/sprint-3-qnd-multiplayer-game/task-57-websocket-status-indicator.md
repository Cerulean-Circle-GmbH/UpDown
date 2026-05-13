[Back to Sprint 3 Planning](./planning.md)

# Task 57: WebSocket Status Indicator in Chat Header

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirement (Tron)
Show a WebSocket connection status indicator on the RIGHT side of the chat/messaging pane header, opposite the invite button (which is on the left).

Colors:
- 🟢 Green = connected
- 🔴 Red = disconnected
- 🟠 Orange = reconnecting

## Implementation
1. Add a small colored dot/circle to the right side of the chat header bar
2. WebSocketClient must expose connection state (connected/disconnected/reconnecting)
3. Update dot color on WebSocket open/close/error/reconnect events
4. Should be visible at all times when in a room

## Acceptance Criteria
- [ ] Green dot visible in chat header when connected
- [ ] Red dot when WebSocket disconnects
- [ ] Orange dot during reconnection attempts
- [ ] Positioned on right side of chat header, opposite invite button
- [ ] Updates in real-time on connection state changes
- [ ] Rebuilt with esbuild
