[Back to Sprint 3 Planning](./planning.md)

# Task 68: BUG — Enforce Result Button Visible to Non-Host

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem (Tron)
Non-host players see the "Enforce Result" button. Only the host should see host control buttons (Enforce Result, Next Round). Non-host should see "Waiting for host..." instead.

## Fix
Check the `this.isHost` guard in MultiplayerUI.ts renderGame() where Enforce Result and Next Round buttons are rendered. The guard may be missing or the isHost flag not updated correctly after host transfer.

## Acceptance Criteria
- [ ] Non-host players NEVER see Enforce Result or Next Round buttons
- [ ] Non-host sees "Waiting for host..." when host is controlling
- [ ] Host still sees both buttons correctly
- [ ] Works after host transfer (new host gets buttons, old host loses them)
- [ ] Rebuilt with esbuild
