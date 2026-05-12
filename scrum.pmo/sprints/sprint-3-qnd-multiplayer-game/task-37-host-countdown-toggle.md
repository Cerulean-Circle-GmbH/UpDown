[Back to Sprint 3 Planning](./planning.md)

# Task 37: Host Countdown Toggle + Force Next Round
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-370000000001]
[uc:uuid:560d9a46,224c5b9e]

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Traceability
  - up
    - [uc:uuid:560d9a46] UC-G1: game.start
    - [uc:uuid:224c5b9e] UC-RD2: round.countdown
  - down
    - [Task 37.1: Architect — state diagram update](./room-lifecycle-state.puml in spec/)

## Use Case Reference
- **UC:** UC-G1 game.start + UC-RD2 round.countdown + new UC-H5 host.toggleCountdown + UC-H6 host.forceResolve
- **UC UUIDs:** 560d9a46, 224c5b9e
- **Implementation:** GameRoom.ts countdownEnabled field, TOGGLE_COUNTDOWN + FORCE_RESOLVE handlers, MultiplayerUI.ts toggle switch + force button
- **Commit:** 494c343f5
- **Architect diagram:** room-lifecycle-state.puml (hostControl state added)

## Problem
During testing, the 10-second countdown is counterproductive — forces waiting between rounds. Host needs control over pacing.

## Acceptance Criteria
1. Host can toggle countdown on/off via toggle switch in game UI
2. When OFF: no countdown timer starts, no ticks broadcast
3. When OFF: host sees "Force Next Round →" button
4. Force Next Round resolves round immediately (even if not all players played)
5. allPlayed still auto-resolves when countdown OFF (no button needed)
6. Non-host players cannot toggle or force — UI hidden for non-host
7. Toggle persists across rounds within same game
8. Default is ON (backwards compatible with existing behavior)
9. TOGGLE_COUNTDOWN message: host→server, toggles countdownEnabled
10. FORCE_RESOLVE message: host→server, resolves current round

## Test File
`qnd/test/vitest/task-37-countdown-toggle.test.ts` (to be created)

## Test Structure
```typescript
// @uc:uuid:560d9a46,224c5b9e
describe('Task 37: Host Countdown Toggle', () => {
  it('AC1: TOGGLE_COUNTDOWN disables countdown', async () => { ... });
  it('AC2: no COUNTDOWN ticks when disabled', async () => { ... });
  it('AC4: FORCE_RESOLVE resolves round immediately', async () => { ... });
  it('AC5: allPlayed auto-resolves with countdown OFF', async () => { ... });
  it('AC6: non-host TOGGLE_COUNTDOWN rejected', async () => { ... });
  it('AC7: toggle persists across rounds', async () => { ... });
  it('AC8: default is ON', async () => { ... });
});
```

## Architect Review
- [x] AC matches room-lifecycle-state.puml hostControl state design
- [x] AC is specific and testable
- [x] State diagram shows countdown vs hostControl parallel paths
- [x] No DRY violation — single toggle implementation
