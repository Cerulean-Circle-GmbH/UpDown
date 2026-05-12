[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.14: Expert — Persistent Round Feedback When Countdown Off + Host "Enforce Next Round"
[subtask:uuid:a4b5c6d7-e8f9-4a0b-bcde-38140000000001]
[uc:uuid:e5c73817]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
1. After a player plays a card and the result is revealed, the feedback (correct/wrong, score change) fades away quickly — even when countdown is OFF. With no countdown, there's no time pressure, so the feedback should stay visible until the host starts the next round.
2. The host needs a clearly visible "Enforce Next Round" button when countdown is disabled, shown AFTER results are revealed.

## Current Behavior
- ROUND_RESULT arrives → feedback shown → fades after ~3 seconds
- Exchange phase → next round auto-starts (or host presses existing "Next Round")

## Correct Behavior (countdown OFF)
- ROUND_RESULT arrives → feedback shown → stays PERMANENTLY visible
- No auto-fade, no timer
- Host sees "Enforce Next Round ▶" button below the feedback
- Host presses button → sends FORCE_NEXT_ROUND → next round starts → feedback clears
- Non-host sees "Waiting for host..." below feedback

## Correct Behavior (countdown ON)
- No change — current behavior is correct (feedback fades, timer drives rounds)

## Implementation

### Server (GameRoom.ts)
- When countdownEnabled=false: do NOT auto-start exchange timer after resolveRound()
- Room stays in 'revealing' state until host sends FORCE_NEXT_ROUND
- FORCE_NEXT_ROUND handler already exists from Task 37 — verify it works from revealing state

### Client (MultiplayerUI.ts)
- On ROUND_RESULT: check if countdownEnabled is false
- If false: do NOT set fade timeout on feedback element
- Show "Enforce Next Round ▶" button for host (visible, prominent)
- Show "Waiting for host..." for non-host
- On FORCE_NEXT_ROUND / ROUND_START: clear feedback, hide button

## Acceptance Criteria
1. Countdown OFF + round resolved → feedback stays visible indefinitely
2. Host sees "Enforce Next Round ▶" button after results
3. Host presses button → next round starts, feedback clears
4. Non-host sees "Waiting for host..." after results
5. Countdown ON → feedback still fades normally (no regression)
6. Button label is "Enforce Next Round" (not "Next Round" — distinct from countdown variant)
