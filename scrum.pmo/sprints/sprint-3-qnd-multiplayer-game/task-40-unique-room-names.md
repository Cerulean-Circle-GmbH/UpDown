[Back to Sprint 3 Planning](./planning.md)

# Task 40: Unique Room Names — Auto-append Number on Duplicate
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-400000000001]
[uc:uuid:fbfed148]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Players can create rooms with identical names. Multiple "Marcel's Room" in the lobby is confusing.

## Correct Behavior (Tron decision: auto-append number)
- First room: "Marcel's Room"
- Second room same name: "Marcel's Room (2)"
- Third: "Marcel's Room (3)"
- Server checks existing room names on CREATE_ROOM, auto-appends if duplicate

## Implementation
In server.ts CREATE_ROOM handler or RoomManager.createRoom():
1. Get proposed room name
2. Check if any active room already has that name
3. If duplicate: append " (N)" where N is the next available number
4. Create room with unique name

## Acceptance Criteria
1. Create "Marcel's Room" → name is "Marcel's Room"
2. Create another "Marcel's Room" → name becomes "Marcel's Room (2)"
3. Pre-created rooms (2p, 3p, etc.) are not affected
4. Room list shows unique names for all rooms
