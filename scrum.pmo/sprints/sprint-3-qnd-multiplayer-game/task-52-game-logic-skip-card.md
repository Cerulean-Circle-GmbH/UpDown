[Back to Sprint 3 Planning](./planning.md)

# Task 52: CRITICAL BUG — Game Skips Betting on Revealed Card

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem (Tron report)
Game logic skips a betting step. Flow should be:
```
Previous: 4 → Current: 7 (hidden)
Player bets UP → reveal 7 → CORRECT
Previous: 7 → Current: 9 (hidden)
Player bets UP → reveal 9 → CORRECT
Previous: 9 → Current: X (hidden)
Player bets on X...
```

But ACTUAL behavior:
```
Previous: 4 → Current: 7
Bet UP → 7 revealed → CORRECT
7 → 9 revealed → CORRECT (never bet on 9!)
Immediately betting on next card after 9
```

The player never gets to bet on the second card (9). After revealing 7, the game shows 9 but immediately advances without waiting for a bet.

## Root Cause Investigation
1. Check round resolution in GameRoom.ts — does resolveRound() immediately start next round?
2. Check if countdown/timer auto-advances before player can bet
3. Check if ROUND_START fires before client shows result feedback
4. Check client MultiplayerUI — does it skip the betting UI after ROUND_RESULT?
5. May be a race between ROUND_RESULT display and ROUND_START for next round

## Acceptance Criteria
- [ ] After each round result, player MUST bet before next card reveals
- [ ] Game waits for player input (Up/Down/Even) every round
- [ ] No auto-advancing past a betting opportunity
- [ ] Sequence: show result → wait for bet → reveal → show result → wait for bet...
- [ ] Works with countdown ON and OFF
- [ ] Rebuilt with esbuild + server restarted
