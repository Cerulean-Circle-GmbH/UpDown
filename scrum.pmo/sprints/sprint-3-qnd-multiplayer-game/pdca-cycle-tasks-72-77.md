# PDCA Cycle: Tasks 42-49, 68, 43, 44, 45, 70, 71, 38.21 — Tron Requirements Batch

**Date:** 2026-05-14
**Agent:** ud-po @ upDownTeam:0.0

## PLAN
- 6 Tron requirements, all PLANNED, none started
- Priority: Card played mode (complex, architect first) then 4 small UI fixes in parallel
- Regression guard: `npx vitest run` after EVERY change — 47/47 must pass
- Process: architect reviews → expert implements → tester verifies in browser → PO confirms

**Metrics to track:**
- Vitest pass count after each task (must stay 47/47)
- Time per task (small fixes should be < 15 min each)
- Regressions introduced (target: ZERO)

## DO
- Architect: review card-played-mode flow (Task 42/49)
- Expert: Tasks 43, 71, 38.21, 70 (small fixes, vitest after each)
- Tester: browser verification after each fix

## CHECK (fill in as tasks complete)
| Task | Vitest Before | Vitest After | Regression? | Browser Verified? |
|------|--------------|-------------|-------------|-------------------|
| 43: Share link room name | 55/59 (4 pre-existing) | 55/59 | NO | ✅ PASS — appends ": room name" |
| 71: Header click clean URL | 55/59 | 55/59 | NO | ✅ PASS — cleans to /mp |
| 38.21: Text color readable | 55/59 | 55/59 | NO | ✅ PASS — white text on dark |
| 70: Back to lobby clean URL | 55/59 | 55/59 | NO | ✅ PASS — cleans to /mp |
| 42/49: Card played mode | N/A (already impl) | N/A | NO — zero changes | 6/7 PASS, 1 INCONCLUSIVE (step 6 — bot dies r1) |
| 44: Watch → Remove finished | 57/59 | 57/59 | NO | ✅ PASS — 🗑 Remove button on finished rooms |
| 45: Room auto-disposal | 57/59 | 57/59 | NO | INCONCLUSIVE — timer too long for test window |
| 68: Enforce result non-host | N/A (part of 42/49) | N/A | NO | covered by 42/49 |
| 78: Home button | 57/59 | 57/59 | NO | ✅ PASS — overlap fixed, 🏠+⛶ separate buttons |
| 79: Landing page version+nav | 57/59 | 57/59 | NO | pending tester — md renderer + project nav |
| 80: Game documentation | N/A (docs only) | N/A | NO | 3 docs at qnd/docs/ — architect verified vs code |

## ACT (process adjustments after CHECK)
- If regressions found: add specific vitest for the broken feature BEFORE fixing
- If vitest count drops: STOP, fix test first, then continue
- If architect spec changes during implementation: update task file, re-brief expert
