[Back to Sprint 3 Planning](./planning.md)

# Task 89: QR Code Invite — Popup Dialog from Room "Invite Friends" Button

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Report (via browser bug report)
"in the game room we have two invite friends buttons. keep the one in the chat as is, but behind the one under start game create a qr code for the room to scan. make it a popup dialog that can be scanned and clicked away"

## Requirements
1. **Two "Invite Friends" buttons exist** — keep both, different behavior:
   - Chat area button: keep as-is (copies link / shares)
   - Under Start Game button: opens QR code popup dialog

2. **QR Code Popup:**
   - Shows QR code encoding the room join URL (with room slug + key if private)
   - Large enough to scan from another phone
   - Dismiss by clicking outside or X button
   - Clean popup/modal overlay

3. **QR Code Generation:**
   - Client-side QR generation (use a lightweight lib like `qrcode` npm or inline SVG generator)
   - No server-side rendering needed — URL is known client-side

## Files to Modify
| File | Change |
|------|--------|
| MultiplayerUI.ts | "Invite Friends" under Start Game → opens QR popup instead of share |
| multiplayer.html or MultiplayerUI.ts | QR popup modal HTML/CSS |
| package.json | Add QR code lib if needed (or use canvas-based generator) |

## Acceptance Criteria
- [ ] "Invite Friends" button under Start Game opens QR code popup
- [ ] QR code encodes the room join URL
- [ ] Popup dismissible (click outside or X)
- [ ] Chat "Invite Friends" button unchanged (still copies/shares link)
- [ ] QR scannable from another device → opens room
- [ ] Vitest passes
