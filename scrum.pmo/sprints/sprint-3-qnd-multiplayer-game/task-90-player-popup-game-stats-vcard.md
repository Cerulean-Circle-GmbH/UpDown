[Back to Sprint 3 Planning](./planning.md)

# Task 90: Player Popup — Show Game Stats + vCard Download (Not Devices)

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Report (via browser bug report)
"in the game room you can click the player, here are the devices listed. but we moved them to the profile. instead add here the game state (points level diamonds) and a button to download a vcard from the player, so he can be added to the contacts"

## Requirements

### Remove from player popup
- ❌ Device list — already on /profile page, remove from game room player popup

### Add to player popup
- ✅ Game stats: points, level, diamonds (current game state)
- ✅ vCard download button — generates .vcf file for the player so they can be added to contacts

### vCard (.vcf)
Generate a standard vCard 3.0 file with:
- FN (full name): player display name
- NOTE: game stats summary
- URL: room join link (optional)
- Download as `{playerName}.vcf` on button click

## Files to Modify
| File | Change |
|------|--------|
| MultiplayerUI.ts | Player popup: remove device list, add game stats (score, level, diamonds) |
| MultiplayerUI.ts | Add "Download vCard" button to player popup |
| MultiplayerUI.ts or new util | vCard generation function → .vcf Blob → download |

## Acceptance Criteria
- [ ] Player popup in game room shows score, level, diamonds (not devices)
- [ ] "Download vCard" button in popup
- [ ] Clicking downloads a valid .vcf file with player name
- [ ] Device list NOT shown in game room popup (only on /profile)
- [ ] Vitest passes
