[Back to Sprint 3 Planning](./planning.md) | [Back to Task 87](./task-87-bug-report-client-to-po.md)

# Task 87.1: Fix Bug Report Target — Route to PO (0.0), Not Expert (0.2)

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Bug
First test bug report arrived at upDownTeam:0.2 (expert) instead of upDownTeam:0.0 (PO). The `bugReportTarget` default in server.ts points to wrong pane.

## Root Cause
Server.ts hardcoded default target is likely 'upDownTeam:0.2' or was set during testing. Must be 'upDownTeam:0.0' (PO pane).

## Fix
1. server.ts: change `bugReportTarget` default to `'upDownTeam:0.0'`
2. If data/agent-pairing.json exists, update it too
3. Verify: send test bug report from browser → arrives at upDownTeam:0.0

## Acceptance Criteria
- [ ] bugReportTarget default = 'upDownTeam:0.0' in server.ts
- [ ] Test bug report arrives at PO pane (0.0), not expert (0.2)
- [ ] Write .md acknowledging first test bug report received
