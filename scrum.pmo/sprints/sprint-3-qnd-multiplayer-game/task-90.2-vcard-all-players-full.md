[Back to Sprint 3 Planning](./planning.md) | [Back to Task 90](./task-90-player-popup-game-stats-vcard.md)

# Task 90.2: vCard — Full Contact Info for ALL Players (Not Just Self)

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Tron Direction
This is NOT about privacy — it's about games, connecting and fun turning into pervasive relationships. Players who play together should be able to easily add each other as contacts.

## Requirements
- vCard for ANY player (not just self) includes ALL available profile fields:
  - PHOTO (profile picture)
  - TEL (phone)
  - URL
  - NOTE with UUID + game stats
- Server must broadcast profile contact info (phone, url, avatar) to other players in the room
- Every player popup vCard has the same full data

## Fix
- Remove the "self vs other" distinction in vCard generation
- Server: include phone, url, avatar in player data broadcast (PLAYER_JOINED or player list)
- Client: use broadcast data for vCard generation for any player

## Acceptance Criteria
- [ ] Clicking any player → vCard download includes their phone, url, photo
- [ ] Server broadcasts contact info to room players
- [ ] No distinction between self/other player vCards
- [ ] Vitest passes
