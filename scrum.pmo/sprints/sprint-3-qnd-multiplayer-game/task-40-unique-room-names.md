[Back to Sprint 3 Planning](./planning.md)

# Task 40: Unique Room Names — Auto-append Number on Duplicate
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-400000000001]
[uc:uuid:fbfed148]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:fbfed148] UC-R2: room.create
    - New: UC-R12 room.create.uniqueName (added to use case diagram)
  - down
    - None (atomic — single method in RoomManager)

## Use Case Reference
- **UC:** UC-R2 room.create + UC-R12 room.create.uniqueName
- **UC UUID:** fbfed148
- **Implementation target:** RoomManager.ts createRoom() or server.ts CREATE_ROOM handler

## Problem
Players can create rooms with identical names. Multiple "Marcel's Room" in the lobby is confusing.

## Design

```typescript
// In RoomManager.ts createRoom() — before new GameRoom():
function uniqueRoomName(proposed: string, existingRooms: Map<string, GameRoom>): string {
  const names = [...existingRooms.values()].map(r => r.name);
  if (!names.includes(proposed)) return proposed;
  
  let n = 2;
  while (names.includes(`${proposed} (${n})`)) n++;
  return `${proposed} (${n})`;
}
```

## Acceptance Criteria
1. Create "Marcel's Room" when no room with that name exists → name is "Marcel's Room"
2. Create "Marcel's Room" when one already exists → name becomes "Marcel's Room (2)"
3. Create "Marcel's Room" when (1) and (2) exist → name becomes "Marcel's Room (3)"
4. Pre-created rooms ("Quick 2P", "Quick 3P", etc.) are not renamed
5. ROOM_JOINED response contains the deduped name (client sees final name)
6. Room list shows all unique names

## Test File
`qnd/test/vitest/uc-r12-unique-room-names.test.ts`

## Test Structure
```typescript
// @uc:uuid:fbfed148 UC-R12 room.create.uniqueName
describe('UC-R12 room.create.uniqueName', () => {
  it('AC1: first room keeps original name', async () => { ... });
  it('AC2: duplicate name gets (2) appended', async () => { ... });
  it('AC3: third duplicate gets (3)', async () => { ... });
  it('AC4: preset rooms unaffected', async () => { ... });
  it('AC5: ROOM_JOINED has deduped name', async () => { ... });
});
```

## Architect Review
- [x] AC matches Tron's requirement (auto-append number)
- [x] AC is specific and testable
- [x] UC-R12 added to qnd-usecase-diagram.puml
- [x] No DRY violation — single dedup function
