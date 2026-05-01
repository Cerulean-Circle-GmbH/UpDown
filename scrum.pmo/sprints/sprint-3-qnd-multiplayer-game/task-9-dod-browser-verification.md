[Back to Sprint 3 Planning](./planning.md)

# Task 9: DoD Browser Verification

## Status
- [ ] Planned

## Why This Task Exists
Previous tester verification used WebSocket protocol messages only — never loaded the page in a browser. DoD requires "works in browser" — must verify with actual browser rendering.

## Acceptance Criteria (ALL must be browser-verified)
- [ ] Lobby UI renders: room list, create button, join with key
- [ ] 2 tabs: both see each other in room player list
- [ ] Game UI renders: GM card, countdown timer, Up/Down/Even buttons
- [ ] Card play works via clicking buttons (not just WS messages)
- [ ] Round results display with scores and streaks
- [ ] Special card UI: inventory visible, can play Protective Shell
- [ ] Game over screen with leaderboard
- [ ] PWA install prompt works
