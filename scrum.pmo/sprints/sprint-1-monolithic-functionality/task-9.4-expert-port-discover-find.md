[Back to Sprint 1 Planning](./planning.md)

# Task 9.4: Expert — Port discover/find commands + bidirectional sync

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Port discover(identifier), find(name), list(), references(identifier) methods from Unit.prod DefaultUnit to Unit/0.3.23.1 DefaultUnit. These work at the unit-reference level (searching for copies across project). Note: H2 bidirectional sync (detectCopyChanges, syncFromCopy, syncToCopy) deferred to Sprint 2.

## Acceptance Criteria
- [ ] discover() method ported\n- [ ] find() method ported\n- [ ] list() method ported\n- [ ] references() method ported\n- [ ] npx tsc zero errors
