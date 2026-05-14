[Back to Sprint 3 Planning](./planning.md)

# Task 80: Game Documentation — Rules, Special Cards, Gameplay

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Description
Write documentation about the UpDown card game in a docs/ directory. Must be accessible via the version-click project nav (T79 markdown renderer).

### Content Required
1. **Game Rules** — how UpDown works, rounds, scoring, win condition
2. **Special Cards** — each special card, what it does, when it triggers
3. **Multiplayer** — rooms, host controls, spectate mode, countdown toggle
4. **Game Modes** — Single Player JS, Single Player TS, Multiplayer differences

### Location
- `qnd/docs/game-rules.md` — main rules document
- `qnd/docs/special-cards.md` — special card reference
- `qnd/docs/multiplayer.md` — multiplayer features
- Link from T79 project nav under "Docs"

## Process
Architect reads the game code (SpecialCards.ts, GameRoom.ts, game logic) and writes accurate docs. Expert reviews for technical accuracy. Tester verifies docs render via T79 markdown server.

## Acceptance Criteria
- [ ] qnd/docs/game-rules.md exists with complete rules
- [ ] qnd/docs/special-cards.md lists all special cards with effects
- [ ] qnd/docs/multiplayer.md covers rooms, host, spectate, countdown
- [ ] All docs accessible via version-click nav on / page
- [ ] Docs render as HTML with working links
- [ ] Content matches actual game behavior (verified against code)
