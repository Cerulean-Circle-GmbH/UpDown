[Back to Sprint 3 Planning](./planning.md)

# Task 39: WebSocket Reconnection — Don't Kick Players on Temporary Disconnect
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-390000000001]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem (from architect use case completeness review)
Any WebSocket disconnect permanently kicks the player from the room. On mobile, brief network drops (tunnel, elevator, cell handoff) are common. Players lose their game progress.

## Correct Behavior
1. Server keeps player slot for X seconds after disconnect (grace period)
2. Client auto-reconnects with same playerId
3. Server restores player to same room/game state
4. If grace period expires → player eliminated as today

## Subtasks
- 39.1: Architect — Design reconnection protocol (RECONNECT message, grace period, state restore)
- 39.2: Expert — Server: grace period on disconnect, RECONNECT handler
- 39.3: Expert — Client: auto-reconnect with playerId, re-join room
- 39.4: Tester — Verify reconnection works (kill WS, reconnect within grace period)

## Priority
HIGH for mobile play. DEFERRED if deadline pressure — current behavior is functional, just not resilient.

## Acceptance Criteria
1. Player disconnects briefly → reconnects → still in same room with same state
2. Grace period configurable (default 30 seconds)
3. Other players see "Player disconnected..." then "Player reconnected!"
4. If grace expires → player eliminated (no change from today)
