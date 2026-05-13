[Back to Sprint 3 Planning](./planning.md)

# Task 49: Card Played Mode — Host Card Triggers Live Player State Updates

## Status
- [x] Planned
- [ ] Architect Review (42.1 said flow exists — needs re-review with NEW requirements)
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirement (Tron — Priority)

### Flow
1. Host plays their card → enters 'card played' state
2. The MOMENT host plays: start showing other players' state (who has played, who hasn't), update live as each player plays their card
3. IF countdown OFF: host sees "Enforce Result" button (NOT "enforce next round")
4. IF countdown ON: countdown starts for other players to play
5. Host presses "Enforce Result" → forces all cards revealed (for non-responding players)
6. After result/feedback phase: button changes to "Next Round" (NOT "enforce next round")

### Key Distinctions from Existing
- "Enforce Result" (new label) — forces card reveal, NOT next round
- "Next Round" (new label) — advances to next round after feedback
- Live player state display — shows who played / who hasn't in real-time
- Two-phase host control: enforce result THEN next round (sequential, not same button)

## Subtasks
- [ ] 49.1: Architect — Review: does existing forceNextRound cover this, or do we need a new FORCE_REVEAL + separate NEXT_ROUND? Review button labels vs existing. Spec the live player state display.
- [ ] 49.2: Expert — Server: implement card-played state with live player tracking, FORCE_REVEAL (distinct from FORCE_NEXT_ROUND), sequential button states
- [ ] 49.3: Expert — Client: live player state display (who played/waiting), "Enforce Result" button → "Next Round" button transition
- [ ] 49.4: Expert — WebSocket: broadcast player-played events live as each player submits guess
- [ ] 49.5: Tester — Verify: 2+ player game with countdown OFF, host controls flow, live updates visible, correct button labels at each phase

## Acceptance Criteria
- [ ] Host plays card → enters card-played state
- [ ] Other players' state shown live (played ✓ / waiting ⏳) the moment host plays
- [ ] Updates in real-time as each player plays their card
- [ ] Countdown OFF: host sees "Enforce Result" (not "enforce next round")
- [ ] Countdown ON: countdown starts for other players
- [ ] "Enforce Result" forces all cards revealed
- [ ] After reveal/feedback: button changes to "Next Round" (not "enforce next round")
- [ ] Two sequential buttons, not one combined button
- [ ] Non-host players never see host control buttons
- [ ] Rebuilt with esbuild
