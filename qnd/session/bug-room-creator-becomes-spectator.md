# BUG: Room Creator Stuck as Spectator + Deadlock

**Reported by:** ud-tester
**Date:** 2026-05-11
**Severity:** CRITICAL — game unplayable
**Room:** McDonges's Room (id: c0140fd4)

## Symptoms

1. **McDonges created "McDonges's Room" but is in spectator/watching mode** — cannot play cards
2. **MacStudio is host** — should be McDonges (room creator)
3. **Deadlock** — MacStudio played a card, McDonges can't play (spectator), round never resolves
4. **Spectator join not reflected** — tester joined as spectator via WebSocket, no UI update visible to players

## Evidence

Tester spectated room at 19:40:20 UTC:
```
SPECTATING room: McDonges's Room — players: ['MacStudio', 'McDonges']
```
- Room state was `countdown` with round 1
- No ROUND_START, COUNTDOWN, PLAY_CARD, or ROUND_RESULT events received during 3 minutes of spectating
- Complete freeze

## Likely Cause

When McDonges reconnected or the room was created via a specific flow:
- Room creator was added as spectator instead of player
- Or: host transfer fired incorrectly on reconnect
- Or: the `?join=` URL flow adds users differently than CREATE_ROOM

## Bugs Filed

| ID | Description |
|----|-------------|
| BUG-QND-1 | Room creator ends up as spectator instead of player — host assigned to wrong client |
| BUG-QND-2 | Game deadlocks when a "player" is actually a spectator — no timeout or error recovery |
| BUG-QND-3 | Spectator join via WebSocket not reflected in room UI (spectator count not updating for existing clients) |

## Reproduction Steps (to investigate)

1. Open browser at /mp
2. Create room (auto-named "{name}'s Room")
3. Open second browser/tab, join same room
4. Check: is creator still a player? Is creator the host?
5. Start game — does creator get ROUND_START with ability to play?

## Fix Areas

- `GameRoom.ts:103 addPlayer()` — verify creator path vs joiner path
- `server.ts CREATE_ROOM` handler — verify player is added, not spectated
- `GameRoom.ts` — add timeout for rounds where not all players respond (prevent infinite deadlock)
- Spectator broadcast — verify `SPECTATOR_JOINED` is sent to all clients in room
