[Back to Sprint 1 Planning](./planning.md)

# CMM Assessment — @web4x De-monolithization (2026-04-21)

**Goal:** Reach CMM4 for the web4x component ecosystem
**Current Composed Level:** L1 (weakest links drag everything down)
**Assessed by:** web4-po @ web4team:0.0

## Per-Component Assessment

| # | Component | Compilation | CLI/Self-Reg | PDCA Files | Tootsie Tests | Import Rewiring | CMM Level |
|---|-----------|------------|-------------|------------|---------------|-----------------|-----------|
| 1 | @web4x/ucp | L3 (0 errors) | L3 (self-reg + info) | L1 (zero) | L1 (zero) | N/A (foundation) | **L1** |
| 2 | @web4x/unit | L3 (0 errors) | L2 (basic CLI) | L1 (zero) | L1 (zero) | L3 (verified) | **L1** |
| 3 | @web4x/persistence | L3 (0 errors) | L2 (basic CLI) | L1 (zero) | L1 (zero) | L3 (verified) | **L1** |
| 4 | @web4x/user | L3 (0 errors) | L2 (basic CLI) | L1 (zero) | L1 (zero) | L3 (verified) | **L1** |
| 5 | @web4x/filesystem | L3 (0 errors) | L2 (basic CLI) | L1 (zero) | L1 (zero) | L3 (verified) | **L1** |
| 6 | @web4x/http | L3 (0 errors) | L2 (basic CLI) | L1 (zero) | L1 (zero) | L3 (verified) | **L1** |
| 7 | @web4x/tls | L3 (0 errors) | L2 (basic CLI) | L1 (zero) | L1 (zero) | L3 (verified) | **L1** |
| 8 | @web4x/web4tscomponent | L3 (0 errors) | L3 (full CLI) | L1 (zero for 0.3.23.0) | L1 (zero) | L3 (verified) | **L1** |
| 9 | @web4x/once | L3 (0 errors) | L2 (basic CLI) | L1 (zero) | L1 (zero) | L1 (not rewired) | **L1** |
| 10 | @web4x/web4test | L3 (0 errors) | L3 (from template) | L1 (zero) | L1 (zero) | N/A (standalone) | **L1** |
| 11 | @web4x/tootsie | L3 (0 errors) | L3 (from template) | L1 (zero) | L1 (zero) | N/A (standalone) | **L1** |
| 12 | @web4x/pdca | L3 (0 errors) | L3 (from template) | L1 (zero) | L1 (zero) | N/A (standalone) | **L1** |
| 13 | @web4x/idealminimal | L3 (0 errors) | L3 (from template) | L1 (zero) | L1 (zero) | N/A (standalone) | **L1** |

## Per-Capability Assessment

| Capability | Level | Evidence | Weakest Link? |
|------------|-------|----------|---------------|
| TypeScript compilation | L3 | All 13 compile, 0 errors, deterministic | |
| Cascading build | L3 | Cold start verified, build.sh parses file: deps | |
| Import path rewiring | L3 | T3/T4/T5 verified, @web4x/* paths | |
| CLI self-registration | L2 | Works but inconsistent (UCP has full CLI, others have skeleton) | |
| source.env / lib-project-root.sh | L1 | Only ONCE has it; 6 new components missing | **YES** |
| PDCA documentation | L1 | Zero PDCA files for any 0.3.23.0 component | **YES** |
| Tootsie tests | L1 | Zero OOP test classes (P25 violation) | **YES** |
| Sprint planning | L2 | Sprint 1+2 planning created (this session) but no completed cycles yet | |
| Loss report / extraction audit | L3 | Comprehensive audit done, every gap documented | |
| Server start parity | L1 | Not tested — once-v0.3.23.0 start not verified | **YES** |
| Boundary file placement | L1 | 20+ files deferred without extraction | **YES** |
| Semantic link promotion | L1 | 0.3.23.0 not linked as dev/latest | |
| Process improvement method | L1 | No PDCA cycle completed yet → can't change process based on data | **YES** |

## Composed Level: L1

**Why L1:** Six capabilities at L1 drag the entire system down. The strengths (compilation L3, import rewiring L3, cascading build L3) are negated by zero PDCA, zero Tootsie tests, and unverified server start.

## Path to L2 (Repeatable)
- [ ] Complete Sprint 1 Task 1 (boundary extraction) — proves extraction is repeatable
- [ ] Create at least 1 PDCA per component for the extraction work done
- [ ] At least 1 Tootsie test per extracted component (not vitest — P25)
- [ ] Verify once-v0.3.23.0 start launches server

## Path to L3 (Defined — Deterministic)
- [ ] All 13 components have source.env, lib-project-root.sh, CLI with self-registration
- [ ] Sprint planning with full traceability (requirements ↔ tasks ↔ subtasks)
- [ ] Written process: "how to extract a new component" documented as repeatable recipe
- [ ] Tootsie test suite per component with > 80% acceptance criteria coverage

## Path to L4 (Managed — PDCA Feedback Loops)
- [ ] PDCA cycle after every sprint: Plan → Do → Check (measure) → Act (change process)
- [ ] Tester measures extraction coverage % and reports regression
- [ ] Process adjustment based on data: if coverage drops, extraction recipe updated
- [ ] Committed PDCA files that reference previous PDCA → chain of improvement
- [ ] CMM assessment re-run after each sprint to measure level change

## PO Actions (Immediate)
1. **Delegate to Expert:** Sprint 1 Task 1 (boundary extraction) — start now
2. **Delegate to Tester:** Create 1 Tootsie test for @web4x/ucp (foundation — if foundation has no test, nothing does)
3. **Write first PDCA:** Document the extraction audit as PDCA (Plan: audit, Do: agents compared, Check: loss report, Act: Sprint 1 created)
4. **Fix weakest link:** source.env for all 7 new components before anything else
