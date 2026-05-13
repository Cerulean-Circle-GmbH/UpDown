[Back to Sprint 3 Planning](./planning.md)

# Task 41: Room Cleanup — Owner Remove + Auto-remove Stale Finished Games
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-410000000001]
[uc:uuid:96f2ecd5]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:96f2ecd5] UC-R10: room.leave (related — room lifecycle)
    - New: UC-R13 room.remove, UC-R14 room.autoCleanup (added to use case + state diagrams)
  - down
    - [Task 41.2: Expert — Server REMOVE_ROOM + autoCleanup](implementation)
    - [Task 41.3: Expert — Client Remove/Watch buttons](implementation)

## Use Case Reference
- **UC:** UC-R13 room.remove + UC-R14 room.autoCleanup
- **Implementation target:** server.ts REMOVE_ROOM handler, RoomManager.ts cleanupStale(), LobbyUI.ts button rendering

## Problem
1. Finished rooms linger in lobby forever — clutters room list
2. No way for host to remove their finished room
3. "Watch" button on finished rooms doesn't distinguish owner from visitor

## Design

### UC-R13: room.remove (host only)

```
Client → Server:
{ type: 'REMOVE_ROOM', roomId: 'abc123' }

Server validation:
  1. Room exists?
  2. Room state === 'finished'?
  3. Sender === room.hostId?
  If all yes → remove room from RoomManager
  Broadcast updated ROOM_LIST to all clients

Server → All:
{ type: 'ROOM_LIST', rooms: [...] }  // updated list without removed room
```

### UC-R14: room.autoCleanup (on CREATE_ROOM trigger)

```
On every CREATE_ROOM:
  1. Scan all rooms
  2. For each room where:
     - state === 'finished'
     - players.size === 0 (no one connected)
     - NOT autoRecreate (not preset rooms)
  3. Remove from RoomManager
  4. Log cleanup
```

### Client: button rendering per room

```
For each room in ROOM_LIST:
  if room.state === 'finished':
    if room.hostId === myClientId:
      show "🗑 Remove" button → sends REMOVE_ROOM
    else:
      show "👁 Watch" button → sends SPECTATE
  else if room.state === 'waiting':
    show "Join" button → sends JOIN_ROOM
  else:
    show "👁 Watch" button → sends SPECTATE
```

**Requirement:** ROOM_LIST must include `hostId` per room so client can decide button. Currently `info()` returns hostId — verify it's in listRooms() response.

## Acceptance Criteria
1. Finished room shows "🗑 Remove" button for room host
2. Finished room shows "👁 Watch" button for non-host players
3. Host presses "Remove" → REMOVE_ROOM sent → room disappears from all clients' lobby
4. Non-host sends REMOVE_ROOM → server rejects (no effect)
5. REMOVE_ROOM on active/waiting room → server rejects (only finished rooms removable)
6. Creating a new room triggers cleanup of stale finished rooms (0 connected players)
7. Active and waiting rooms are NOT affected by auto-cleanup
8. Preset auto-recreate rooms are NOT affected by auto-cleanup
9. Room list updates for ALL clients after removal (broadcast ROOM_LIST)

## Test File
`qnd/test/vitest/uc-r13-room-remove.test.ts`

## Test Structure
```typescript
// @uc:uuid:96f2ecd5 UC-R13+R14 room.remove + autoCleanup
describe('UC-R13 room.remove', () => {
  it('AC1: host can remove finished room', async () => { ... });
  it('AC4: non-host REMOVE_ROOM rejected', async () => { ... });
  it('AC5: REMOVE_ROOM on active room rejected', async () => { ... });
  it('AC9: all clients receive updated ROOM_LIST after removal', async () => { ... });
});

describe('UC-R14 room.autoCleanup', () => {
  it('AC6: CREATE_ROOM triggers cleanup of stale finished rooms', async () => { ... });
  it('AC7: active rooms not cleaned', async () => { ... });
  it('AC8: preset rooms not cleaned', async () => { ... });
});
```

## Architect Review
- [x] AC is specific and testable
- [x] UC-R13 and UC-R14 added to qnd-usecase-diagram.puml
- [x] Room lifecycle state diagram updated: finished → removed transitions
- [x] ROOM_LIST includes hostId for client-side button logic
- [x] Three-way button rendering: Remove (host+finished), Watch (non-host+finished/active), Join (waiting)
