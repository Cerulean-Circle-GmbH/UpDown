[Back to Sprint 3 Planning](./planning.md)

# Task 92: Bug Report Input — Live Character Counter

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Tron Requirement
If the bug report input field has a character limit, show a live character counter like 'x/500' so the user knows how much space is left BEFORE submitting. No silent truncation.

## Implementation
- Bug report textarea: add live counter below showing `{current}/{max}` (e.g. "42/500")
- Update on every keystroke (input event)
- When approaching limit: change color (e.g. red at 450+)
- maxlength attribute on textarea prevents exceeding limit client-side
- No server-side silent truncation — what user types is what gets sent

## Files to Modify
| File | Change |
|------|--------|
| All 4 HTML pages (or shared JS) | Add counter element below bug report textarea |
| Bug report JS handler | Update counter on input event |
| CSS | Counter styling, red warning near limit |

## Acceptance Criteria
- [ ] Live 'x/500' counter visible below bug report textarea
- [ ] Updates on every keystroke
- [ ] Color changes near limit (e.g. red at 90%+)
- [ ] Cannot exceed 500 chars (maxlength)
- [ ] No silent truncation anywhere in the pipeline
- [ ] Vitest passes
