[Back to Sprint 3 Planning](./planning.md)

# Task 33: Auto-name Rooms with Host Player Name
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-330000000001]
[uc:uuid:fbfed148]

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:fbfed148] UC-R2: room.create
  - down
    - None (atomic — implemented in server.ts)

## Use Case Reference
- **UC:** UC-R2 room.create
- **UC UUID:** fbfed148
- **Implementation:** server.ts CREATE_ROOM handler, LobbyUI.ts room name input prefill

## Task Description
When a player creates a room without providing a name, auto-generate the name as `{playerName}'s Room`. UI prefills the input field with the default name.

## Acceptance Criteria
1. Room created without name → shows "{playerName}'s Room" in ROOM_LIST response
2. Room created with explicit name → uses that name (no override)
3. Pre-created rooms (2p, 3p, etc.) keep their original names ("Quick 2P", etc.)
4. LobbyUI.ts prefills room name input with "{playerName}'s Room"
5. Player can edit the prefilled name before creating

## Test File
`qnd/test/vitest/uc-r2-room-create.test.ts` (AC covered by existing room.create test)

## Test Structure
```typescript
// Covered within UC-R2 test suite
describe('UC-R2 room.create [fbfed148]', () => {
  it('AC1: room without name defaults to playerName\'s Room', async () => { ... });
  it('AC2: explicit name overrides default', async () => { ... });
});
```

## Architect Review
- [x] AC matches UC-R2 room.create spec
- [x] AC is specific and testable
- [x] No DRY violation — single implementation point
