[Back to Sprint 3 Planning](./planning.md)

# Task 69: BUG — Player Appears Twice After Leave/Rejoin Cross-Device

## Status
- [x] Planned
- [ ] Architect Analysis
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem (Tron)
Scenario:
1. Device A creates room, enters it
2. Device B joins the room
3. Device A leaves the room, then rejoins
4. Device B leaves the room, then re-enters
5. Device A now appears TWICE in the player list

## Root Cause Investigation (Architect)
1. Does LEAVE_ROOM properly remove the player from GameRoom.players?
2. On rejoin, does addPlayer() check if the playerToken already exists in the room?
3. The token-based dedup (Task 60) may only check on JOIN — not handling the leave+rejoin case where the old player entry wasn't cleaned up
4. Is the WebSocket connection closed on LEAVE_ROOM? Or does the old WS connection still hold a player slot?
5. Cross-device = different tokens, so token dedup won't catch this — it's the same device with same token leaving and rejoining but old entry not removed

## Acceptance Criteria
- [ ] Leave room fully removes player from GameRoom.players
- [ ] Rejoin with same token replaces old entry (not adds second)
- [ ] Player list never shows same person twice
- [ ] Works cross-device (leave/rejoin from either device)
- [ ] Rebuilt with esbuild + server restarted
