[Back to Sprint 3 Planning](./planning.md) | [Back to Task 87](./task-87-bug-report-client-to-po.md)

# Task 87.2: Bug Report — Include Reporter UUID + Auto-Create .md Task File

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Bug Report (via browser, Anonymous)
"you need to add the uuid of the reporter to the bug report and create a md file like a task but as an bug report.md and update it in the planning.md"

## Requirements
1. **Reporter UUID in bug report**: The BUG_REPORT message must include the reporter's playerToken/UUID so PO knows who reported it
2. **Auto-create .md file**: When a bug report arrives, PO (or server) should create a `bug-report-{timestamp}.md` file in the sprint directory, formatted like a task file
3. **Update planning.md**: The bug report .md should be linked from planning.md under a "Bug Reports" section

## Changes

### Server-side
- BUG_REPORT message includes `playerToken` and player name
- otmux send prompt includes: `[@browser-user {name} {uuid}] BUG REPORT: {text}`

### PO-side (this agent)
- On receiving a bug report prompt, create:
  `scrum.pmo/sprints/sprint-3-qnd-multiplayer-game/bug-report-{YYYYMMDD-HHMMSS}.md`
- Format like a task file with Status, Description, Reporter UUID
- Add link to planning.md under "## Bug Reports (from browser)"

## Acceptance Criteria
- [ ] Bug report includes reporter UUID/name
- [ ] .md file auto-created on receipt
- [ ] planning.md updated with link to bug report
- [ ] Vitest passes
