[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.2: Tester — UC-R2 room.create vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320200000000]
[uc:uuid:fbfed148]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-R2 room.create + UC-R3 room.create.private + UC-R1 rooms.list
- **UC UUIDs:** fbfed148, 177c8da5, 1c21171d, 7cd55a0b
- **Implementation:** WebSocketClient.ts:60 createRoom() / RoomManager.ts:643 createRoom() / GameRoom.ts:103 addPlayer()
- **Current test:** protocol-test-suite.js:91 TC2.1, :101 TC2.3, :105 TC2.2

## Acceptance Criteria
1. CREATE_ROOM with name + maxPlayers → ROOM_JOINED response with room.id, room.name, room.maxPlayers
2. Creator's playerId === room.hostId (creator becomes host)
3. CREATE_ROOM with roomKey → room.isPrivate === true
4. Private room does NOT appear in LIST_ROOMS response
5. Public room DOES appear in LIST_ROOMS response
6. Room has playerCount: 1 after creation (creator is first player)
7. Creator receives players[] array containing themselves

## Test File
`qnd/test/vitest/uc-r2-room-create.test.ts`

## Test Structure
```typescript
// @uc:uuid:fbfed148,177c8da5,1c21171d,7cd55a0b
describe('UC-R2 room.create [fbfed148]', () => {
  it('AC1: CREATE_ROOM returns ROOM_JOINED with id, name, maxPlayers', async () => { ... });
  it('AC2: creator becomes host (hostId === playerId)', async () => { ... });
  it('AC3: roomKey makes room private', async () => { ... });
  it('AC4: private room hidden from LIST_ROOMS', async () => { ... });
  it('AC5: public room visible in LIST_ROOMS', async () => { ... });
  it('AC6: playerCount is 1 after creation', async () => { ... });
  it('AC7: creator in players[] array', async () => { ... });
});
```

## Architect Review
- [x] AC matches UC-R2/R3/R1 spec from use case tree and traceability matrix
- [x] AC is specific and testable
