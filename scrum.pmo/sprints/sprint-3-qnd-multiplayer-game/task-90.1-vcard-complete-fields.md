[Back to Sprint 3 Planning](./planning.md) | [Back to Task 90](./task-90-player-popup-game-stats-vcard.md)

# Task 90.1: vCard — Include All Profile Fields

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Requirements
The vCard (.vcf) must include ALL available profile data:

- **PHOTO:** uploaded profile picture (base64 data URL from localStorage or server)
- **TEL:** phone number from PlayerProfile.phone
- **URL:** url from PlayerProfile.url
- **NOTE:** include user UUID (playerToken) + game stats
- **FN:** player display name (already there)

## vCard 3.0 Fields
```
BEGIN:VCARD
VERSION:3.0
FN:{playerName}
TEL:{phone}
URL:{url}
PHOTO;ENCODING=b;TYPE=JPEG:{base64ImageData}
NOTE:UUID: {playerToken}\nScore: {score}\nDiamonds: {diamonds}\nLevel: {level}
END:VCARD
```

## Data Sources
- Name: from game state / player list
- Phone + URL: server must include in player data sent to client (may need to add to ROUND_START or player info broadcast)
- Photo: from avatar data (localStorage or server profile)
- UUID: playerToken from server

## Acceptance Criteria
- [ ] vCard contains PHOTO field with profile picture (if uploaded)
- [ ] vCard contains TEL field with phone number (if set)
- [ ] vCard contains URL field (if set)
- [ ] vCard NOTE includes player UUID
- [ ] vCard downloads correctly and imports into phone contacts
- [ ] Vitest passes
