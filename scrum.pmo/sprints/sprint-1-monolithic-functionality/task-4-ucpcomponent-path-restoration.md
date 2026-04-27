[Back to Sprint 1 Planning](./planning.md)

# Task 4: UcpComponent Path Accessor Restoration

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Architect decided: do NOT restore 423 removed lines. Instead add 2 protected helpers (projectRoot, componentsDirectory) that derive from model.componentRoot. No circular CLI back-reference.

## Acceptance Criteria
- [x] Architect spec (4.1) delivered\n- [ ] Expert implements helpers (4.2)\n- [ ] Tester verifies info/links (4.3)
