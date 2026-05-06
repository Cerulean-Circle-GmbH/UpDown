# PDCA Checkpoint 1 — Sprint 0 Unit Migration & Repair

**Date:** 2026-05-04
**Author:** unit-po @ unitTeam:0.0

## PLAN
Fix 39,987 flat scenario files, fix TsAstExtractor root cause, clean astray dirs.

## DO
- Expert created UnitRepair.ts (Task 3.2) — moves flat files to 5-level UUID structure
- Expert fixed TsAstExtractor.ts lines 261/346/640 (Task 4.1) — new uuidToIndexPath() method
- Expert ran repair on scenarios (Task 5.1 — started early)
- Architect traced root cause (Task 2.1) and reviewed fix (APPROVED)
- Tester compared correct vs broken units (Task 1.5) and verified repair results

## CHECK (measured)
| Metric | Before | After | Target | Status |
|--------|--------|-------|--------|--------|
| Flat files in index/ | 10,026 | 0 | 0 | PASS |
| Files in 5-level structure | 29,961 | 29,971 | all | PASS |
| Astray dirs at root | 4 (ONCE, box, components, local.once) | 2+ remaining | 0 | FAIL |
| .type.scenario.json suffix | 10,026 | 0 | 0 | PASS |
| TsAstExtractor fix | buggy | 3 lines fixed, architect APPROVED | fixed | PASS |
| Version 0.0.0.0 | exists | fix in progress (Task 4.3) | 0 | IN PROGRESS |
| W4TSC compilation | — | 0 errors | 0 | PASS |

## ACT
- Task 3.4 (astray dirs cleanup) assigned to expert
- Task 4.3 (version 0.0.0.0 fix) assigned to expert
- Sprint 1 backlog: refactor TsAstExtractor to use ScenarioService (DRY, per architect review)
- Process learning: task files with acceptance criteria worked — agents delivered measurable results

## Process Improvement
- CMM observation: Phase 1 (understand) and Phase 2 (fix) ran in parallel, which worked but violated dependency order in planning.md. Acceptable for this sprint — but for CMM4, PDCA cycles should follow planned order.
- Tester caught the astray dir gap — verification is essential, not optional.
