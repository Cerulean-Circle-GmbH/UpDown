[Back to Sprint 3 Planning](./planning.md)

# Task 59: Profile Photo — Upload Broken + Not Shown in Game

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Problems (Tron)
1. Upload photo in profile editor doesn't work — file input or FileReader callback broken
2. Uploaded/chosen avatar not displayed in player profile popup (click player name)
3. Uploaded/chosen avatar not displayed in in-game player list/dialogue

## Fix
1. Debug file input change handler, FileReader onload, localStorage save of dataURL
2. Player profile popup: read updown-avatar from localStorage, display as img (dataURL) or card render
3. In-game player list: same — show avatar instead of default initials circle

## Acceptance Criteria
- [ ] Photo upload works — file picker opens, image saved to localStorage
- [ ] Preview updates immediately in profile editor after upload
- [ ] Player profile popup shows uploaded photo or chosen card
- [ ] In-game player list shows avatar
- [ ] Default initials circle shown when no avatar set
- [ ] Rebuilt with esbuild
