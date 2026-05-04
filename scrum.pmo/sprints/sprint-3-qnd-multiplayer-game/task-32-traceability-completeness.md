[Back to Sprint 3 Planning](./planning.md)

# Task 32: Full UUID Traceability — CMM4 Completeness

## Goal
Every use case across all 3 spec files must have a consistent UUID that links:
**PUML UseCase ↔ Traceability Diagram ↔ Traceability Matrix ↔ Test File ↔ Implementation**

## Current Gaps
- traceability-diagram.puml: 0 UUIDs (uses short labels only)
- qnd-usecase-diagram.puml: 21 UUIDs (but 75 UCs exist — 54 missing)
- traceability-matrix.md: UUIDs on all 75 but some only 8-char short form
- protocol-test-suite.js: 16 UUID annotations (only covered TCs)
- Implementation files: 0 UUID annotations

## Subtasks

### 32.1: Architect — UUID Consistency Audit
- List all 75 UCs from traceability-matrix.md with their full UUIDs
- Cross-check: does each UUID appear in qnd-usecase-diagram.puml?
- Cross-check: does each UUID appear in traceability-diagram.puml?
- Deliver: gap list showing which UUIDs are missing from which file

### 32.2: Architect — Add UUIDs to qnd-usecase-diagram.puml (54 missing)
- Every UC element in the PUML must have `' @uc:uuid:<8-char-short>`
- Must match the UUID in traceability-matrix.md exactly
- Re-render SVG

### 32.3: Architect — Add UUIDs to traceability-diagram.puml (all 75)
- Dashboard cards must include UUID short form
- Detailed chain section must reference UUIDs
- Re-render SVG

### 32.4: Expert — Add UUID comments to implementation files
- For each COVERED UC (13): add `// [uc:uuid:<8-char>] UC-XX: object.verb` comment at the implementation method
- For each PARTIAL UC (5): same
- Format: single line comment above the method, not JSDoc pollution

### 32.5: Expert — Add UUID comments to test files
- protocol-test-suite.js: ensure all 37 test functions have `// [uc:uuid:<8-char>]`
- Match UUIDs to traceability-matrix.md

### 32.6: Tester — Verify bidirectional consistency
- Pick 5 random UUIDs from the matrix
- Trace each forward: matrix → PUML → diagram → impl file → test file
- Trace each backward: test file → impl file → matrix → PUML
- Report PASS/FAIL per UUID

## Acceptance Criteria
- [ ] All 75 UCs have consistent UUIDs across all 3 spec files
- [ ] qnd-usecase-diagram.puml has 75 @uc:uuid annotations
- [ ] traceability-diagram.puml references all 75 UUIDs
- [ ] All 13 covered + 5 partial impl methods have [uc:uuid] comments
- [ ] All test functions have [uc:uuid] comments
- [ ] Tester verifies 5 bidirectional traces — all PASS
- [ ] All PUMLs render to SVG with zero errors
