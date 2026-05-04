[Back to Sprints](../)

# Sprint 0 Planning — Unit Component Migration & Repair

## Sprint Goal
Understand, diagnose, and fix the Unit component (0.3.23.1) so that its scenario storage is correct and self-healing. Fix the 39,987 misplaced unit files in `scenarios/index/`. Ensure 0.3.23.1 has all corrected features from the prod version (0.3.0.5). This sprint is prerequisite to Sprint 1.

## Sprint Overview
**Duration:** 3 days
**Focus:** Bug diagnosis, repair function, cleanup of 39,987 flat files
**Team:** unit-po (0.0), unit-architect (0.1), unit-expert (0.2), unit-tester (0.4)
**Scenarios path:** `/Users/Shared/Workspaces/AI/Claude/workspaces/UpDown/scenarios/`
**Version:** All fixes on Unit/0.3.23.1

## Audit Findings (2026-05-04)

### Bug 1: Flat Index Files (CRITICAL)
- **39,987** `.type.scenario.json` files dumped directly in `scenarios/index/`
- They SHOULD be in 5-level UUID subfolder: `index/{a}/{b}/{c}/{d}/{e}/uuid.scenario.json`
- The subfolder structure EXISTS (`index/0/` through `index/f/`) — so some units went correctly
- **Root cause hypothesis:** `uuidFolderPathGenerate()` in UcpStorage or the calling code sometimes writes to `index/` flat instead of `index/a/b/c/d/e/`

### Bug 2: Astray Top-Level Directories
- `scenarios/ONCE/`, `scenarios/box/`, `scenarios/components/`, `scenarios/local.once/`
- Only `index/`, `domain/`, `type/` should exist at root
- **Root cause hypothesis:** `domainPathBuild()` or `typePathBuild()` returning paths without the `domain/` or `type/` prefix, OR ScenarioManager writing to wrong base path

### Bug 3: Version 0.0.0.0 Units
- `type/Unit/0.0.0.0` exists — 
- **Root cause:** Component version detection fails (same BUG-W02 pattern from W4TSC — import.meta.url not resolving version)

## Requirements
See [requirements.md](./requirements.md) for full traceability.

## Task List (Sprint 0)

### PHASE 1: UNDERSTAND (Day 1)

- [ ] [Task 1: Deep-Read Unit Source Code](./task-1-deep-read-unit-source.md)
  **Priority:** 0 (PREREQUISITE)
  - [ ] [Task 1.1: Expert — Read UcpStorage.ts line by line (scenarioSave, uuidFolderPathGenerate, symlinkCreate)](./task-1.1-expert-read-ucpstorage.md)
  - [ ] [Task 1.2: Expert — Read ScenarioService.ts (scenarioSave wrapper, how it calls UcpStorage)](./task-1.2-expert-read-scenarioservice.md)
  - [ ] [Task 1.3: Expert — Read UnitDiscoveryService.ts (what triggers unit creation)](./task-1.3-expert-read-unitdiscovery.md)
  - [ ] [Task 1.4: Architect — Compare prod 0.3.0.5 UcpStorage vs 0.3.23.1 UcpStorage](./task-1.4-architect-compare-storage.md)
  - [ ] [Task 1.5: Tester — Catalog one correct unit (in subfolder) vs one broken unit (flat) — diff structure](./task-1.5-tester-compare-units.md)

- [ ] [Task 2: Root Cause Analysis](./task-2-root-cause-analysis.md)
  **Priority:** 0 (PREREQUISITE)
  - [ ] [Task 2.1: Architect — Trace code path: what calls scenarioSave() and how UUID path is constructed](./task-2.1-architect-trace-codepath.md)
  - [ ] [Task 2.2: Expert — Identify where flat writes happen (grep for direct fs.writeFile to index/)](./task-2.2-expert-identify-flat-writes.md)
  - [ ] [Task 2.3: Expert — Identify astray dir bug (where ONCE/, box/, components/ get created at wrong level)](./task-2.3-expert-identify-astray-dirs.md)
  - [ ] [Task 2.4: Expert — Identify version 0.0.0.0 bug (version detection failure)](./task-2.4-expert-identify-version-bug.md)

### PHASE 2: FIX (Day 2)

- [ ] [Task 3: Implement Repair Function](./task-3-implement-repair.md)
  **Priority:** 1 (CRITICAL)
  - [ ] [Task 3.1: Architect — Spec the repair function (input: flat files, output: correct 5-level structure)](./task-3.1-architect-repair-spec.md)
  - [ ] [Task 3.2: Expert — Implement `unit repair` CLI command in Unit/0.3.23.1](./task-3.2-expert-implement-repair.md)
  - [ ] [Task 3.3: Expert — Repair moves flat files to correct UUID subfolder + updates symlinks](./task-3.3-expert-repair-move-files.md)
  - [ ] [Task 3.4: Expert — Repair removes astray top-level dirs (ONCE/, box/, components/, local.once/) by relinking to correct paths](./task-3.4-expert-repair-astray-dirs.md)
  - [ ] [Task 3.5: Tester — Run repair on test subset (10 units), verify correct structure](./task-3.5-tester-repair-test.md)

- [ ] [Task 4: Fix Root Cause Bugs](./task-4-fix-root-causes.md)
  **Priority:** 1 (CRITICAL — prevent recurrence)
  - [ ] [Task 4.1: Expert — Fix uuidFolderPathGenerate() to ALWAYS use 5-level structure](./task-4.1-expert-fix-uuid-folder.md)
  - [ ] [Task 4.2: Expert — Fix domainPathBuild/typePathBuild to include correct prefix](./task-4.2-expert-fix-path-builders.md)
  - [ ] [Task 4.3: Expert — Fix version detection (import.meta.url pattern)](./task-4.3-expert-fix-version-detection.md)
  - [ ] [Task 4.4: Tester — Create new unit after fix, verify it lands in correct 5-level path](./task-4.4-tester-verify-new-units.md)

### PHASE 3: MIGRATE (Day 3)

- [ ] [Task 5: Full Migration](./task-5-full-migration.md)
  **Priority:** 1 (CRITICAL)
  - [ ] [Task 5.1: Expert — Run `unit repair` on full 39,987 flat files](./task-5.1-expert-run-full-repair.md)
  - [ ] [Task 5.2: Expert — Verify all symlinks in type/ and domain/ still resolve](./task-5.2-expert-verify-symlinks.md)
  - [ ] [Task 5.3: Expert — Remove astray top-level dirs after relinking](./task-5.3-expert-remove-astray.md)
  - [ ] [Task 5.4: Tester — Post-migration audit: count files in correct structure vs remaining flat](./task-5.4-tester-post-migration-audit.md)
  - [ ] [Task 5.5: Tester — Verify `once-v0.3.23.1 start` still works after migration](./task-5.5-tester-once-start-after-migration.md)

- [ ] [Task 6: Port Missing Prod Features to 0.3.23.1](./task-6-port-prod-features.md)
  **Priority:** 2 (HIGH)
  - [ ] [Task 6.1: Architect — List all features in prod 0.3.0.5 missing from 0.3.23.1](./task-6.1-architect-feature-gap.md)
  - [ ] [Task 6.2: Expert — Port UnitCLI commands (create, list, info, repair)](./task-6.2-expert-port-unit-cli.md)
  - [ ] [Task 6.3: Expert — Port .ts.unit file creation to UnitDiscoveryService](./task-6.3-expert-port-ts-unit-creation.md)
  - [ ] [Task 6.4: Expert — Port MDAv4 fields (origin, typeM3, references[]) to UnitModel](./task-6.4-expert-port-mdav4-fields.md)
  - [ ] [Task 6.5: Tester — Verify ported features match prod behavior](./task-6.5-tester-verify-ported-features.md)

## Dependencies
- Task 1 must complete before Task 2 (understand before diagnosing)
- Task 2 must complete before Tasks 3 and 4 (diagnosis before fix)
- Task 3 before Task 5 (repair function before full migration)
- Task 4 before Task 5 (fix bugs before creating more units)
- Task 6 can start after Task 4 (ported features use fixed storage)

## Definition of Done
- [ ] Zero flat files remaining in `scenarios/index/` (all in 5-level UUID structure)
- [ ] Zero astray dirs at `scenarios/` root (only index/, domain/, type/)
- [ ] Zero `0.0.0.0` version entries in `type/`
- [ ] `unit repair` CLI command exists and works
- [ ] New units created after fix land in correct 5-level structure
- [ ] All type/ and domain/ symlinks resolve correctly
- [ ] `once-v0.3.23.1 start` works after migration
- [ ] Root causes documented in PDCA

## Sprint Metrics
- **Flat files remaining:** 39,987 → 0
- **Astray dirs remaining:** 4 → 0
- **0.0.0.0 versions remaining:** count → 0
- **Symlink integrity:** broken symlinks before vs after
- **Prod feature parity:** features ported from 0.3.0.5 to 0.3.23.1

---

**Product Owner:** unit-po @ unitTeam:0.0
**Created:** 2026-05-04
**Sprint:** Sprint 0 — Unit Migration & Repair (prerequisite to Sprint 1)
