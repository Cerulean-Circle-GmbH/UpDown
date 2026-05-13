[Back to Sprint 3 Planning](./planning.md)

# Task 42: Card Played Mode — Host Plays Card with Live Updates

## Status
- [x] Planned
- [ ] In Progress (Architect review first)
- [ ] QA Review
- [ ] Done

## Requirement (Tron)
Host plays a card → if countdown OFF: show "Enforce Result" button. If countdown ON: countdown starts. After feedback shown → "Next Round" button. All state changes live-update to other players.

## Flow
1. Host selects Up/Down/Even → card is played
2. IF countdown OFF: host sees "Enforce Result" button, other players see "Waiting for host..."
3. Host clicks "Enforce Result" → round result revealed to ALL players
4. After result feedback → host sees "Next Round" button
5. Host clicks "Next Round" → next round starts for ALL
6. All state transitions broadcast via WebSocket to all players in real-time

## Subtasks
- [ ] 42.1: Architect — Review game state machine, confirm this flow fits existing states (revealing → result → next round)
- [ ] 42.2: Expert — Server: implement card-played → enforce-result → next-round state flow
- [ ] 42.3: Expert — Client: host buttons (Enforce Result, Next Round), non-host waiting states
- [ ] 42.4: Expert — WebSocket: broadcast state changes to all players live
- [ ] 42.5: Tester — Verify 2-player game with countdown OFF: host controls flow, other player sees updates

## Acceptance Criteria
- [ ] Host plays card, sees "Enforce Result" when countdown off
- [ ] Other players see "Waiting for host..." during host decision
- [ ] "Enforce Result" reveals round result to ALL players
- [ ] "Next Round" button appears after result feedback
- [ ] All state changes live-update to non-host players
- [ ] Countdown ON mode still works normally (no regression)
- [ ] Rebuilt with esbuild
