[Back to Sprint 1 Planning](./planning.md)

# Task 9: Port Unit.prod Capabilities to Unit 0.3.23.1

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Port missing capabilities from Unit.prod (0.3.0.5) to Unit 0.3.23.1. Architect gap analysis found 20 files, ~1500 lines missing. Strategy: Merge Forward — keep 0.3.23.x UcpComponent architecture, port prod capabilities. PO decision: do NOT port DefaultStorage (keep @web4x/persistence). H2 bidirectional sync deferred to Sprint 2.

## Acceptance Criteria
- [x] Gap analysis (9.1)\n- [x] GitTextIOR ported (9.2)\n- [x] DefaultStorage CANCELLED (keep @web4x/persistence)\n- [ ] discover/find commands (9.4)\n- [ ] Unit CLI (9.5)\n- [ ] Missing layer3 interfaces (9.6)\n- [ ] Tester verification (9.7)
