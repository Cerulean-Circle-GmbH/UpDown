→[Back to Planning Sprint 30](./planning.md)

# Task 3: FFM.5-FFM.7 Final fs Sync Call Migration
[task:uuid:FFM57-0003-2026-0118-FINAL-FS-MIGRATION]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-3.1-developer-defaultunit-migration.md`)
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
- Source: File/Folder Architecture Completion - Final fs→OOP Migration Phase
- **Up:**
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
  - [File/Folder Architecture Completion PDCA](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
  - [fs→IOR Migration PDCA](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- **Down:**
  - [ ] [Task 3.1: Developer - DefaultUnit fs Migration](./task-3.1-developer-defaultunit-migration.md)
  - [ ] [Task 3.2: Developer - DefaultWeb4TSComponent fs Migration](./task-3.2-developer-web4tscomponent-migration.md)
  - [ ] [Task 3.3: Developer - Remaining Files fs Migration](./task-3.3-developer-remaining-migration.md)
  - [ ] [Task 3.4: Developer - Verification & Cleanup](./task-3.4-developer-verification-cleanup.md)

---

## **What** (WODA)
Eliminate all remaining ~80 fs.*Sync() calls across the codebase, achieving 100% File/Folder OOP architecture completion using IOR pattern and File/Folder OOP methods.

## **Overview** (WODA)
- **Priority:** 1 (Critical - 100% OOP Achievement)
- **Estimated Time:** 9 hours
- **Current State:** ~80 fs.*Sync() calls remain across DefaultUnit, DefaultWeb4TSComponent, and other components
- **Target State:** ZERO fs.*Sync() calls, 100% OOP File/Folder method usage
- **Progress:** File/Folder Architecture 85% → 100% after completion

## Context
The File/Folder Architecture PDCA has reached 85% completion with FFM.4a and FFM.4b establishing the pattern. However, ~80 fs.*Sync() calls remain scattered across the codebase, primarily in DefaultUnit (~4 calls), DefaultWeb4TSComponent (~32 calls), and various utility files (~19 calls). These calls violate P34 (IOR as Unified Entry Point) and prevent full CMM4 Radical OOP compliance. This is the final migration phase.

## Intention
Complete the File/Folder Architecture PDCA by systematically migrating all remaining fs.*Sync() calls to OOP File/Folder methods and IOR pattern. Achieve 100% OOP compliance, eliminate fs module dependency from business logic, and establish fs→OOP as the final architectural pattern. Enable IOR Infrastructure to proceed without conflicts.

---

## **Details** (WODA)

### Files to Modify:
| File | fs Calls | Priority | Pattern |
|------|----------|----------|---------|
| `layer2/DefaultUnit.ts` | ~4 | 1 | IOR.load()/IOR.save() |
| `layer2/DefaultWeb4TSComponent.ts` | ~32 | 1 | Mixed File/Folder/IOR |
| `layer4/*Orchestrator.ts` | ~8 | 2 | File/Folder methods |
| Other utilities | ~11 | 2 | File/Folder methods |
| **TOTAL** | **~55** | - | - |

### Technical Specifications (Complete Code)

**IOR Pattern (Preferred for Read/Write):**
```typescript
// OLD (fs-based):
const content = fs.readFileSync(path, 'utf8');
const data = JSON.parse(content);

// NEW (IOR pattern - P34 compliant):
const data = await IOR.load(path);
```

**File Existence Check:**
```typescript
// OLD:
if (fs.existsSync(path)) {
  // process
}

// NEW (OOP):
const file = await File.init({ path });
if (await file.exists()) {
  // process
}
```

**Directory Operations:**
```typescript
// OLD:
const entries = fs.readdirSync(dir);

// NEW (OOP):
const folder = await Folder.init({ path: dir });
const entries = await folder.list();
```

**File Write:**
```typescript
// OLD:
fs.writeFileSync(path, JSON.stringify(data));

// NEW (IOR):
await IOR.save(path, data);

// OR (File class):
const file = await File.init({ path });
await file.write(JSON.stringify(data));
```

---

## **Actions** (WODA)

### 1. Comprehensive Audit
- [ ] Scan entire src/ directory for all fs.*Sync() calls using grep
- [ ] Create inventory by file, line number, and operation type
- [ ] Categorize by pattern (exists, read, write, readdir, stat, etc.)
- [ ] Identify which calls can use IOR vs File/Folder classes

### 2. DefaultUnit Migration (~4 calls, 1h)
- [ ] Identify all fs calls in DefaultUnit.ts
- [ ] Replace with IOR.load()/IOR.save() where applicable
- [ ] Update method signatures to async
- [ ] Test IOR integration
- [ ] Remove fs import from DefaultUnit

### 3. DefaultWeb4TSComponent Migration (~32 calls, 6h)
- [ ] Break into smaller methods/sections
- [ ] Systematic replacement of all fs operations
- [ ] Use IOR for file content operations
- [ ] Use File/Folder for existence/listing operations
- [ ] Update method signatures to async, propagate up call chain
- [ ] Comprehensive unit testing after each method
- [ ] Careful testing of core component functionality

### 4. Remaining Files Migration (~19 calls, 4h)
- [ ] Migrate smaller files with 1-3 calls each
- [ ] Follow established patterns from DefaultUnit and DefaultWeb4TSComponent
- [ ] Group similar operations for efficiency
- [ ] Test each file before proceeding

### 5. Verification & Cleanup (2h)
- [ ] Global grep search confirms zero fs.*Sync() calls
- [ ] Verify zero fs module imports except in File/Folder base classes
- [ ] Remove all unused fs imports across codebase
- [ ] Update ESLint rules to prevent future fs.*Sync() usage
- [ ] Run full test suite (unit + integration)
- [ ] Performance benchmarks to verify no regression

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_FFM57_FinalFsMigration.ts
const req = this.requirement('FFM.5-FFM.7 Final fs Sync Migration', 'Complete fs→OOP migration');
req.addCriterion('AC-01', 'Zero fs.*Sync() calls in src/ directory');
req.addCriterion('AC-02', 'All file operations use File/Folder classes or IOR pattern');
req.addCriterion('AC-03', 'No fs module imports except File/Folder base classes');
req.addCriterion('AC-04', 'All tests passing (100% suite)');
req.addCriterion('AC-05', 'No performance regressions vs baseline');
req.addCriterion('AC-06', 'ESLint rules prevent future fs.*Sync() usage');
```

- [ ] **AC-01:** Zero fs.*Sync() calls in src/ directory (grep verified)
- [ ] **AC-02:** All file operations use File/Folder classes or IOR pattern
- [ ] **AC-03:** No fs module imports except File/Folder base classes
- [ ] **AC-04:** All tests passing (100% suite)
- [ ] **AC-05:** No performance regressions vs baseline
- [ ] **AC-06:** ESLint rules prevent future fs.*Sync() usage
- [ ] **AC-07:** Unit tests passing (90%+ coverage)
- [ ] **AC-08:** Integration tests passing
- [ ] **AC-09:** PDCA File/Folder Architecture marked 100% complete

---

## Dependencies

### Prerequisites:
- ✅ FFM.0-FFM.3.6 complete (File/Folder OOP foundation exists)
- ✅ FFM.4a complete (Task 1 - pattern established)
- ✅ FFM.4b complete (Task 2 - ServerHierarchyManager migrated)
- ✅ File/Folder classes ready in layer2
- ✅ IOR infrastructure available

### Blocks:
- 🔵 FFM.8-FFM.9 (Extract File/Folder as separate components)
- 🔵 IOR Infrastructure completion

---

## Definition of Done

- [ ] All fs.*Sync() calls migrated or eliminated
- [ ] Zero fs module imports in business logic layers
- [ ] 100% OOP File/Folder/IOR usage for all file operations
- [ ] Tootsie tests with Web4Requirement passing
- [ ] All unit tests passing (90%+ coverage)
- [ ] Integration tests passing
- [ ] Performance benchmarks show no regression
- [ ] ESLint rules enforced and passing
- [ ] PDCA File/Folder Architecture updated to 100%
- [ ] Code reviewed and merged to dev/claudeFlow.v1

---

## QA Audit & User Feedback

### TRON Requirements - Final fs Sync Migration
```quote
Eliminate all remaining ~80 fs.*Sync() calls achieving 100% File/Folder OOP architecture completion
```

- **Issue:** ~80 fs.*Sync() calls remain scattered across codebase
- **Resolution:** Systematic migration to File/Folder OOP methods and IOR pattern
- **Pattern:** Radical OOP with File/Folder classes and IOR (P34 compliant)

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (state in file/folder models)
- [ ] **P6:** Empty Constructor + init(scenario)
- [ ] **P34:** IOR as Unified Entry Point (File/Folder OOP)
- [ ] **P25:** Tootsie Tests Only (Web4Requirement based)

---

## Related Documents

- [PDCA: File/Folder Architecture Completion](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- [PDCA: fs→IOR Migration](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- [PDCA: Iteration Tracking](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - FFM.5-FFM.7 Final fs Sync Call Migration*
*Priority: Critical - 100% OOP Achievement*
*Pattern: Radical OOP with File/Folder Methods and IOR Pattern*
