[Back to Sprint 3 Planning](./planning.md)

# Task 37: Host Countdown Toggle + Force Next Round
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-370000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:560d9a46] UC-G1: game.start
    - [uc:uuid:224c5b9e] UC-RD2: round.countdown

## Problem
During testing, the 10-second countdown is counterproductive — forces waiting between rounds. Host needs control over pacing.

## Design

### UC-37a: host.toggleCountdown
- Host sees a toggle button: "Countdown: ON/OFF"
- Default: ON (current behavior)
- When OFF: no automatic countdown timer after round start
- Server skips startCountdown() when countdown disabled

### UC-37b: host.forceNextRound
- When countdown is OFF, host sees a "Next Round →" button
- Only visible to host, only when countdown is disabled and all players have played (or host wants to force)
- Sends FORCE_NEXT_ROUND message
- Server resolves round immediately, starts next round

### Messages
- TOGGLE_COUNTDOWN: host→server (toggle on/off)
- COUNTDOWN_SETTING: server→all (broadcast current setting)
- FORCE_NEXT_ROUND: host→server (resolve + next round)

## Subtasks

### 37.1: Architect — Design state diagram for countdown toggle
- Add countdown toggle to room-lifecycle-state.puml
- Show "force next round" as alternative to countdown timeout

### 37.2: Expert — Server: GameRoom countdown toggle
- Add `countdownEnabled: boolean` to GameRoom (default true)
- Handle TOGGLE_COUNTDOWN: only host, toggle flag, broadcast setting
- When countdownEnabled=false: skip startCountdown() in nextRound()
- Handle FORCE_NEXT_ROUND: only host, resolve round immediately

### 37.3: Expert — Client: Host toggle button + force button
- MultiplayerUI: show "⏱ Countdown: ON/OFF" toggle for host
- When OFF: show "Next Round →" button for host after all players played
- Send TOGGLE_COUNTDOWN / FORCE_NEXT_ROUND messages
- Non-host players see "Waiting for host..." when countdown off

### 37.4: Tester — Verify toggle + force flow
- Toggle countdown OFF → no timer shown
- All players play → host sees "Next Round →" → resolves immediately
- Toggle countdown ON → timer resumes normal behavior
- Non-host cannot toggle or force

## Acceptance Criteria
- [ ] Host can toggle countdown on/off during game
- [ ] When off: no countdown timer, host has "Next Round →" button
- [ ] Force next round resolves immediately
- [ ] Non-host players cannot toggle or force
- [ ] Toggle persists across rounds within same game
- [ ] Default is ON (backwards compatible)
