[Back to Sprint 3 Planning](./planning.md)

# Task 53: CRITICAL BUG — Wrong Bet Shows "You Did Not Bet" Instead of Elimination

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem (Tron report)
When a player bets wrong, they should be eliminated (become spectator). This part works. BUT the feedback message says "You did not bet" instead of showing the wrong bet result (e.g. "You bet UP — card was lower — ELIMINATED").

The player needs to know:
1. What they bet (Up/Down/Even)
2. What the actual result was
3. That they're eliminated

NOT "you did not bet" — that's the message for players who timed out without betting.

## Root Cause Investigation
1. Check ROUND_RESULT message — does it include the player's guess and whether it was correct?
2. Check client rendering of round result — is it distinguishing between "wrong guess" and "no guess"?
3. Check if eliminated players receive a different message type
4. The elimination → spectator transition may be clearing the player's guess before the result renders

## Acceptance Criteria
- [ ] Wrong bet shows: "You bet [UP/DOWN/EVEN] — card was [higher/lower/equal] — ELIMINATED"
- [ ] Timeout (no bet) shows: "You did not bet — ELIMINATED"
- [ ] Correct bet shows: "You bet [UP/DOWN/EVEN] — CORRECT!"
- [ ] Eliminated player transitions to spectator view after seeing result
- [ ] Rebuilt with esbuild + server restarted
