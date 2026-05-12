[Back to Sprint 3 Planning](./planning.md)

# Task 41: Room Cleanup — Owner Remove + Auto-remove Stale Finished Games
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-410000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirements
1. Room owners (host) can remove their finished rooms from the lobby
2. Instead of "Watch" button on finished rooms, show "Remove" button for the owner
3. Non-owners still see "Watch" (spectate) for finished rooms
4. Auto-remove stale finished games whenever new rooms are created (cleanup trigger)

## Subtasks
- 41.1: Architect — Add room removal use cases to PUML, specify owner permissions
- 41.2: Expert — Server: REMOVE_ROOM message (host only, state=finished), auto-cleanup on CREATE_ROOM
- 41.3: Expert — Client: "Remove" button for owner on finished rooms, "Watch" for others
- 41.4: Tester — Verify owner can remove, non-owner sees watch, stale cleanup works

## Acceptance Criteria
1. Finished room shows "Remove" button for room creator/host
2. Finished room shows "Watch" for other players
3. Host presses "Remove" → room disappears from lobby for everyone
4. Creating a new room triggers cleanup of stale finished rooms (no players connected)
5. Active/waiting rooms are NOT affected by cleanup
