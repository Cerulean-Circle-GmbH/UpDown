[Back to Sprint 3 Planning](./planning.md)

# Task 2: Multiplayer Game Loop on Server
## Status
- [x] Done (merged into Task 1 — GameRoom.ts includes full game loop)

## What was built
- GM logic: 52-card French-suited deck, 7-card hand, random card selection
- Round loop: GM deals → players place Up/Down/Even → 10s countdown → reveal → score
- Player state: score tracking, alive/eliminated status
- Exchange phase: players can join/leave between rounds

## Acceptance Criteria
- [x] Full game loop in GameRoom.ts
- [ ] Tester: game loop works with 2+ players (pending Task 2.5)
