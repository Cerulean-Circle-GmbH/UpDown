[Back to Sprint 17 Planning](./planning.md)

# Task 159: Forward-Only Traceability Chain Refactor
[task:uuid:d4e5f6a7-b8c9-0123-def4-159000000001]

## TRON Literal (Phase 23 — Critical Correction)
> "traceability traces requirements to tasks to use cases to classes and methods. tasks do not trace back to requirements... never back to requirements."

**OVERRIDES:** T155 direction (which allowed bidirectional links).
**HARD BLOCKER for:** T158 (traceability browser).

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement (design — this document)
  - [ ] creating test cases
  - [ ] implementing (strip migration + standard update)
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Traceability
  - down
    - T158: Traceability Browser Full-Chain Data (BLOCKED until T159 done)

## Task Description
Refactor the entire traceability data model to enforce forward-only chain direction. Strip all back-references from existing data. Update the traceability standard to codify forward-only as permanent rule.

## Forward-Only Chain Specification

### The Chain (directional, never reversed)
```
Requirement ──→ Task ──→ UseCase ──→ Class ──→ Method
                 │
                 └──→ Subtask
```

### What "forward-only" means
- **Requirement** points forward to Tasks it requires
- **Task** points forward to Subtasks and Use Cases it implements
- **UseCase** points forward to Classes that implement it
- **Class** points forward to Methods it contains
- **Method** is the LEAF — no forward links

### What is PROHIBITED
- Task MUST NOT have `links.up → Requirement` or `requirement` field
- UseCase MUST NOT have `requirements[]` or `requirement` field  
- Class MUST NOT have `useCases[]` back-reference
- Method MUST NOT have `useCases[]` or `tests[]` back-reference
- No entity except Requirement may reference a Requirement

### Fan-in (many-to-one forward)
Multiple Requirements can point forward to the same Task. This is NOT a back-reference — the Requirement owns the forward pointer. The Task has no knowledge of which Requirements point to it.

```
R1.forwardTo.tasks = [T1, T3]
R2.forwardTo.tasks = [T1, T5]
R3.forwardTo.tasks = [T5]

T1 has NO field referencing R1 or R2.
T5 has NO field referencing R2 or R3.
```

## Design: Data Model Changes

### STRIP from existing interfaces

#### TaskView (BEFORE — T155 era)
```typescript
interface TaskView {
  links: {
    up: TraceLink[];       // ❌ DELETE — back-ref to Requirement
    down: TraceLink[];     // ✅ KEEP as forwardTo.subtasks
    follows: TraceLink[];  // ✅ KEEP as forwardTo.follows (ordering dep)
    changes: TraceLink[];  // ✅ KEEP as forwardTo.changes
  };
}
```

#### TaskView (AFTER — T159 forward-only)
```typescript
interface TaskView {
  uuid: string;
  name: string;
  status: string;
  sprint: string;
  forwardTo: {
    subtasks: SubtaskLink[];
    useCases: UCLink[];
    follows: TaskLink[];     // ordering dependency (not a back-ref)
    changes: FileLink[];
  };
}
```

#### UseCaseView (BEFORE)
```typescript
interface UseCaseView {
  requirements: ReqLink[];  // ❌ DELETE — back-ref
  tasks: TaskLink[];         // ❌ DELETE — back-ref
  classes: ClassLink[];      // ✅ KEEP as forwardTo.classes
}
```

#### UseCaseView (AFTER)
```typescript
interface UseCaseView {
  uuid: string;
  name: string;
  object: string;
  verb: string;
  source: string;
  coverage: string;
  forwardTo: {
    classes: ClassLink[];
  };
}
```

#### ClassView (BEFORE)
```typescript
interface ClassView {
  useCases: UCLink[];     // ❌ DELETE — back-ref
  methods: MethodView[];  // ✅ KEEP as forwardTo.methods
}
```

#### ClassView (AFTER)
```typescript
interface ClassView {
  uuid: string;
  name: string;
  source: string;
  commit: string;
  lines: { start: number; end: number };
  forwardTo: {
    methods: MethodView[];
  };
}
```

#### MethodView (BEFORE)
```typescript
interface MethodView {
  useCases: UCLink[];  // ❌ DELETE — back-ref
  tests: TestLink[];   // ❌ DELETE — back-ref
}
```

#### MethodView (AFTER — LEAF)
```typescript
interface MethodView {
  name: string;
  signature: string;
  source: string;
  commit: string;
  lines: { start: number; end: number };
  // LEAF — no forwardTo
}
```

## Design: Strip Migration

### Step 1: Audit existing data
For every `.unit` file, task file, and scenario that contains back-references:
- Grep for `links.up`, `requirement:`, `requirements[]`, `useCases[]` on Task/UC/Class/Method entities
- List all files containing back-references

### Step 2: Strip back-references
- Remove `links.up` from all task files
- Remove `requirements[]` from UseCase scenarios
- Remove `useCases[]` from Class scenarios
- Remove `useCases[]` and `tests[]` from Method scenarios
- Rename `links.down` → `forwardTo.subtasks`, etc.

### Step 3: Verify forward-only
- Automated check: no entity except Requirement may contain the string `requirement` in its `forwardTo`
- Tester runs: grep -r 'links\.up\|requirements\[' across all sprint/scenario files → zero matches

## Design: Traceability Standard Update

Create `scrum.pmo/standards/traceability-standard.md` with:
1. Forward-only chain rule (permanent, TRON directive)
2. The 5 entity types and their allowed `forwardTo` fields
3. Fan-in rule (many Requirements → one Task)
4. LEAF rule (Method has no forward links)
5. Migration protocol for stripping back-references

## Per-Class Audit Checklist

| Class | Back-refs to strip | Files affected |
|-------|-------------------|----------------|
| RequirementView | NONE (root, only has forwardTo) | — |
| TaskView | `links.up` → DELETE | All task-*.md files |
| UseCaseView | `requirements[]`, `tasks[]` → DELETE | traceability-matrix.md, UC scenarios |
| ClassView | `useCases[]` → DELETE | .ts.unit files, M3 CLASS units |
| MethodView | `useCases[]`, `tests[]` → DELETE | Method scenarios if any |

## Acceptance Criteria (13 AC)

### Data Model (AC-1 to AC-5)
- [ ] AC-1: TaskView has NO `links.up`, NO `requirement` field — only `forwardTo.{subtasks,useCases,follows,changes}`
- [ ] AC-2: UseCaseView has NO `requirements[]`, NO `tasks[]` — only `forwardTo.classes[]`
- [ ] AC-3: ClassView has NO `useCases[]` — only `forwardTo.methods[]`
- [ ] AC-4: MethodView has NO `useCases[]`, NO `tests[]` — LEAF, no forwardTo
- [ ] AC-5: RequirementView is the ONLY entity with forward pointers to Tasks

### Standard & Documentation (AC-6 to AC-8)
- [ ] AC-6: `scrum.pmo/standards/traceability-standard.md` created with forward-only chain spec
- [ ] AC-7: T158 traceability browser design updated to enforce forward-only
- [ ] AC-8: Data shape diff documented (BEFORE vs AFTER for each entity type)

### Migration (AC-9 to AC-11)
- [ ] AC-9: All task files in sprint-1 stripped of `- up` traceability sections
- [ ] AC-10: Fan-in verified: multiple Requirements can point to same Task, Task has no parent field
- [ ] AC-11: `links.down` renamed to `forwardTo.subtasks` in all existing task files

### Verification (AC-12 to AC-13)
- [ ] AC-12: `grep -r 'links\.up\|requirements\[' scrum.pmo/sprints/` returns zero matches (excluding T159 design doc itself)
- [ ] AC-13: Forward walk from any Requirement reaches Method LEAF without encountering any back-reference

## Test Scenarios (10 TS)

### Forward Walk Tests (TS-1 to TS-4)
- [ ] TS-1: Walk R1 → T1 → T1.1 → verify no back-ref on T1 to R1
- [ ] TS-2: Walk R2 → T1 (fan-in same Task) → verify T1 has no knowledge of R1 or R2
- [ ] TS-3: Walk Task → UC-R2 → Class(GameRoom) → Method(addPlayer) → verify LEAF, no forwardTo
- [ ] TS-4: Walk Task → UC-C1 → Class(WebSocketClient) → Method(connect) → verify chain reaches LEAF

### Fan-In Tests (TS-5 to TS-6)
- [ ] TS-5: R1 and R2 both point to T1 — T1 appears in tree under both, T1 JSON has no `requirement` field
- [ ] TS-6: Search "which Requirements reference T3?" by scanning all Requirement.forwardTo.tasks — returns correct set

### Strip Migration Tests (TS-7 to TS-8)
- [ ] TS-7: After strip, `grep -rn 'links\.up' scrum.pmo/sprints/sprint-1*/*.md` → 0 matches
- [ ] TS-8: After strip, task-1-boundary-file-extraction.md Traceability section has `- down` only, no `- up`

### Standard Compliance Tests (TS-9 to TS-10)
- [ ] TS-9: `traceability-standard.md` defines all 7 entity types with allowed forwardTo fields
- [ ] TS-10: New task file created AFTER T159 has no `- up` section — verified by template inspection

## QA Audit
- [ ] [2026-06-01] Tron correction applied — forward-only enforced
  - [ ] Issue: T155 allowed bidirectional — now overridden by T159
  - [ ] Resolution: Strip all back-refs, update standard, block T158 until clean

---

**Architect:** web4-po (acting as architect) @ web4team:0.0
**Sprint:** Sprint 17 — Scenario Units
**Blocks:** T158 (traceability browser)
