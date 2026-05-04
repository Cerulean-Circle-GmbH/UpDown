[Back to Sprint 3 Planning](./planning.md)

# Task 33: Auto-name Rooms with Host Player Name
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-330000000001]

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:fbfed148] UC-R2: room.create
  - down
    - [Task 33.1: Expert — server.ts CREATE_ROOM default name](./task-33.1-expert-room-autoname.md)
    - [Task 33.2: Tester — verify room names in lobby](./task-33.2-tester-room-name-verify.md)

## Task Description
When a player creates a room without providing a name, auto-generate the name as `{playerName}'s Room`. Update server.ts CREATE_ROOM handler.

## Acceptance Criteria
- [ ] Room created without name → shows "{playerName}'s Room" in ROOM_LIST
- [ ] Room created with explicit name → uses that name (no override)
- [ ] Pre-created rooms (2p, 3p, etc.) keep their original names
