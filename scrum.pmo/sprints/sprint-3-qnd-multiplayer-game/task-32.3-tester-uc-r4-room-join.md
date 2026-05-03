[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.3: Tester — UC-R4 room.join vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320300000000]
[uc:uuid:9cc60247]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-R4 room.join + UC-R5/R6 private join + UC-R7 full + UC-R10 leave + UC-H1 host.transfer
- **UC UUIDs:** 9cc60247, 61449e82, 148f2e73, d0b57a5a, 96f2ecd5, dd0392cf
- **Implementation:** GameRoom.ts:103 addPlayer(), :254 removePlayer(), :277 host transfer

## Acceptance Criteria
1. JOIN_ROOM with valid roomId → ROOM_JOINED with players[] including self
2. Existing players receive PLAYER_JOINED with new player info + playerCount
3. JOIN_ROOM with correct roomKey on private room → ROOM_JOINED
4. JOIN_ROOM with wrong roomKey → ERROR 'Wrong room key'
5. JOIN_ROOM on full room (players === maxPlayers) → ERROR
6. JOIN_ROOM during countdown state → ERROR (rejected)
7. JOIN_ROOM during exchange state → ROOM_JOINED (allowed)
8. LEAVE_ROOM → PLAYER_LEFT broadcast to remaining, leaver gets ROOM_LEFT + ROOM_LIST
9. Host leaves → HOST_CHANGED broadcast, next player becomes host

## Test File
`qnd/test/vitest/uc-r4-room-join.test.ts`

## Test Structure
```typescript
// @uc:uuid:9cc60247,61449e82,148f2e73,d0b57a5a,96f2ecd5,dd0392cf
describe('UC-R4 room.join [9cc60247]', () => {
  it('AC1: join returns ROOM_JOINED with players including self', async () => { ... });
  it('AC2: existing players notified via PLAYER_JOINED', async () => { ... });
  it('AC3: correct key on private room → join succeeds', async () => { ... });
  it('AC4: wrong key → ERROR', async () => { ... });
  it('AC5: full room → ERROR', async () => { ... });
  it('AC6: join during countdown → rejected', async () => { ... });
  it('AC7: join during exchange → allowed', async () => { ... });
  it('AC8: leave room → PLAYER_LEFT + ROOM_LIST', async () => { ... });
  it('AC9: host leaves → HOST_CHANGED to next player', async () => { ... });
});
```

## Architect Review
- [x] AC covers join, private join, rejection cases, leave, and host transfer
- [x] AC is specific and testable
