[Back to Sprint 3 Planning](./planning.md) | [Back to Task 38](./task-38-mp-ux-parity.md)

# Task 38.20: Tester — Playwright Visual Verification for All Pending UX Tasks

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Set up Playwright in the qnd project and write visual tests that screenshot and verify all pending UX acceptance criteria. The tester must be able to verify CSS/layout changes without requiring Tron to open a browser.

## Tests to Write
1. **38.10.3** Header consistency: screenshot /ts, /mp lobby, /mp game — verify all show same game-header gradient
2. **38.15** White container + shadow: screenshot /mp — verify #app has white bg, shadow, no header gap
3. **38.16** Purple room panes: screenshot /mp lobby — verify room cards have purple tint
4. **38.17** Cards side-by-side: screenshot /mp game during round — verify cards-row horizontal layout with arrow
5. **38.18** Bottom padding: screenshot /mp game scrolled to bottom — verify content not hidden under chat
6. **38.19** No reload in game: screenshot /mp game header — verify only leave button, no reload

## Setup
1. Install: `npm install -D @playwright/test` in qnd/
2. Install browsers: `npx playwright install chromium`
3. Create: `qnd/test/visual/` directory
4. Server must be running on upDownTeam:0.5

## Acceptance Criteria
- [ ] Playwright installed and working in qnd project
- [ ] Screenshots taken for all 6 checks above
- [ ] Each check reports PASS/FAIL with screenshot evidence
- [ ] No Tron browser verification needed for CSS tasks
