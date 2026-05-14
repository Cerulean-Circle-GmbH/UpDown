[Back to Sprint 3 Planning](./planning.md)

# Task 81: Show Player Level in UI

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Description
Player level determines which special cards they can access (L1/L2/L3). Currently the level is only used internally by SpecialCards.ts — nowhere in the UI shows the player's current level.

Display the player level visibly so players understand:
- What level they are
- Which special cards they have access to at their level
- How to reach the next level

## Location
Show level in the player info area during gameplay (e.g. near score/name, or in the special card inventory panel).

## Acceptance Criteria
- [ ] Player level (1/2/3) visible during gameplay
- [ ] Level shown in player info or card inventory area
- [ ] Clear which cards are available at current level
- [ ] Vitest passes after change
