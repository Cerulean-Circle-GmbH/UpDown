[Back to Sprint 3 Planning](./planning.md)

# Task 60: Player Identity Token (QnD Fix)

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## PO Decision
Option A from architect analysis. UUID token in localStorage, sent on connect/join. Dedup by token. Client avatar sent to server.

## Subtasks
- [ ] 60.1: Expert — Immediate dedup: reject JOIN_ROOM if same playerName+IP already in room (30 min)
- [ ] 60.2: Expert — Client: generate/store UUID in localStorage as updown-player-id, send on connect (5 lines)
- [ ] 60.3: Expert — Server: accept playerToken, map to identity, use client avatar if provided (25 lines)
- [ ] 60.4: Expert — Server: JOIN_ROOM dedup by token — same token in room = reject or replace connection (10 lines)
- [ ] 60.5: Tester — Verify: same browser two tabs can't join as two different players

## Acceptance Criteria
- [ ] Player gets persistent UUID token (survives browser refresh)
- [ ] Token sent on WebSocket connect and JOIN_ROOM
- [ ] Same token can't be in same room twice (dedup)
- [ ] Client's localStorage avatar/name sent to server (not random generated)
- [ ] Second tab with same token replaces old connection (takeover)
- [ ] Rebuilt with esbuild + server restarted
