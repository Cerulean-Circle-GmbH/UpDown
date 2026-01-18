[Back to Planning Sprint 30](./planning.md)

# Task 1: FFM.4a Scenario Housekeeping Migration
[task:uuid:FFM4A-0001-2026-0118-SCENARIO-HOUSEKEEPING]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-1.1-developer-state-marking.md`)
- Subtasks must always indicate the affected role in the filename.
- Subtasks must be ordered to avoid blocking dependencies.

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Traceability
- Source: File/Folder Architecture Completion - Scenario Housekeeping Phase
- **Up:**
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
  - [Scenario Housekeeping Migration PDCA](../../components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md)
- **Down:**
  - [ ] [Task 1.1: Developer - State Marking Implementation](./task-1.1-developer-state-marking.md)
  - [ ] [Task 1.2: Developer - Online State Verification](./task-1.2-developer-online-verification.md)
  - [ ] [Task 1.3: Developer - fs→OOP Migration](./task-1.3-developer-fs-oop-migration.md)

---

## **What** (WODA)
Replace shutdown deletion with state marking, verify online state, and complete fs→OOP migration for scenario housekeeping operations.

## **Overview** (WODA)
- **Priority:** 1 (Critical - Foundation for fs→IOR Migration)
- **Estimated Time:** 8 hours
- **Current State:** Scenario shutdown deletes files, mixed fs/OOP usage
- **Target State:** State marking, 100% OOP File/Folder methods
- **Progress:** File/Folder Architecture 72% → 85% after completion

## Context
Scenario housekeeping in ONCE currently uses direct file deletion on shutdown, losing debugging information and state history. The mixed usage of fs.*Sync() calls and OOP methods creates inconsistency. This task establishes the pattern for all remaining FFM migrations.

## Intention
Create Web4 compliant state management using Radical OOP patterns. Enable scenario preservation for debugging while maintaining clean operation lifecycle. Establish the reference pattern for FFM.4b and FFM.5-FFM.7.

---

## **Details** (WODA)

### Files to Modify:
| File | Purpose | fs calls to migrate |
|------|---------|---------------------|
| `layer2/ServerHierarchyManager.ts` | Scenario management | ~15 |
| `layer2/ScenarioManager.ts` | Lifecycle operations | ~10 |
| `layer4/*Orchestrator.ts` | Housekeeping coordination | ~8 |

### Technical Specifications (Complete Code)

**State Enum:**
```typescript
// File: src/ts/layer3/ScenarioStatus.enum.ts
export enum ScenarioStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SHUTDOWN = 'shutdown'
}
```

**Pattern to Follow:**
```typescript
// OLD (fs-based deletion - violates P34):
if (fs.existsSync(scenarioPath)) {
  fs.unlinkSync(scenarioPath);
}

// NEW (OOP state marking - P34 compliant):
const scenarioFile = await new File().init({ path: scenarioPath });
if (await scenarioFile.exists()) {
  scenario.model.status = ScenarioStatus.SHUTDOWN;
  await scenario.save();  // Preserve with status
}
```

---

## **Actions** (WODA)

### 1. State Marking Instead of Deletion
- [ ] Add `status: ScenarioStatus` field to scenario models
- [ ] Create `markShutdown()` method replacing `deleteScenario()`
- [ ] Preserve scenario files on shutdown for debugging/recovery
- [ ] Implement cleanup policy (configurable retention, default 7 days)

### 2. Online State Verification
- [ ] Add `verifyOnlineState()` method to scenario managers
- [ ] Check state before all operations (load, save, delete)
- [ ] Prevent operations on shutdown scenarios
- [ ] Proper error messages for offline scenario access

### 3. fs→OOP Migration
- [ ] Identify all fs.*Sync() calls in scenario housekeeping code
- [ ] Replace with File/Folder OOP methods per patterns below:
  - `existsSync()` → `file.exists()` / `folder.exists()`
  - `readdirSync()` → `folder.list()`
  - `unlinkSync()` → `file.delete()`
  - `rmdirSync()` → `folder.delete()`

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_FFM4a_ScenarioHousekeeping.ts
const req = this.requirement('FFM.4a Scenario Housekeeping', 'State marking replaces deletion');
req.addCriterion('AC-01', 'Scenario shutdown marks status=shutdown instead of deleting');
req.addCriterion('AC-02', 'Online state verification prevents shutdown scenario operations');
req.addCriterion('AC-03', 'Zero fs.*Sync() calls in scenario housekeeping code');
req.addCriterion('AC-04', 'Cleanup policy respects configured retention period');
```

- [ ] **AC-01:** Scenario shutdown marks status=shutdown instead of deleting
- [ ] **AC-02:** Online state verification prevents shutdown scenario operations
- [ ] **AC-03:** Zero fs.*Sync() calls in scenario housekeeping code
- [ ] **AC-04:** Cleanup policy respects configured retention period
- [ ] **AC-05:** Unit tests passing (90%+ coverage)
- [ ] **AC-06:** Manual test: shutdown scenario, verify file preserved
- [ ] **AC-07:** Manual test: attempt operation on shutdown scenario, verify rejection

---

## Dependencies

### Prerequisites:
- ✅ FFM.0-FFM.3.6 complete (File/Folder OOP foundation exists)
- ✅ File/Folder classes ready in layer2

### Blocks:
- 🔵 Task 2 (FFM.4b ServerHierarchyManager fs cleanup)
- 🔵 Task 3 (FFM.5-FFM.7 final fs migration)

---

## Definition of Done

- [ ] All scenario shutdown operations mark state instead of deleting
- [ ] Online state verification implemented and tested
- [ ] Zero fs.*Sync() calls in scenario housekeeping code
- [ ] Tootsie tests with Web4Requirement passing
- [ ] Integration tests passing
- [ ] Manual testing verified
- [ ] PDCA entry updated with results
- [ ] Code reviewed and merged to dev/claudeFlow.v1

---

## QA Audit & User Feedback

### TRON Requirements - Scenario Housekeeping
```quote
Replace shutdown deletion with state marking, verify online state, complete fs→OOP migration
```

- **Issue:** Scenario deletion loses debugging information
- **Resolution:** State marking preserves files with shutdown status
- **Pattern:** Radical OOP with File/Folder classes (P34 compliant)

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (state in scenario model)
- [ ] **P6:** Empty Constructor + init(scenario)
- [ ] **P34:** IOR as Unified Entry Point (File/Folder OOP)
- [ ] **P25:** Tootsie Tests Only (Web4Requirement based)

---

## Related Documents

- [PDCA: Scenario Housekeeping Migration](../../components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md)
- [PDCA: File/Folder Architecture](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - FFM.4a Scenario Housekeeping Migration*
*Priority: Critical - Foundation for fs→IOR Migration*
*Pattern: Radical OOP with State Marking and File/Folder Methods*
