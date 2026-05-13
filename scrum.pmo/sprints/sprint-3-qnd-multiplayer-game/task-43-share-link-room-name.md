[Back to Sprint 3 Planning](./planning.md)

# Task 43: Share Room Link — Append Room Name

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirement (Tron)
When sharing a room invite link, append ": room name" to the share text so the recipient knows which room they're joining.

## Fix
Find where the share/invite message is generated (likely shareOrCopy() or generateInviteMessage() in ShareUtil or LobbyUI/MultiplayerUI). Append the room name after the URL.

Example: "Join my UpDown game: https://home.donges.it:3443/mp?room=abc123 : Marcel's Room"

## Acceptance Criteria
- [ ] Share text includes room name after the link
- [ ] Works for both lobby share and in-game invite
- [ ] Room name is the actual room name (not generic)
- [ ] Rebuilt with esbuild
