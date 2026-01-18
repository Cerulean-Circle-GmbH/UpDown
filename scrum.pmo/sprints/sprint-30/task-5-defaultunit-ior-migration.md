[Back to Planning Sprint 30](./planning.md)

# Task 5: DefaultUnit IOR Migration
[task:uuid:IOR-0005-2026-0118-DEFAULTUNIT-MIGRATION]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-5.1-developer-ior-analysis.md`)
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
- Source: Web4 IOR Infrastructure Completion - DefaultUnit fs→IOR Migration Phase
- **Up:**
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
  - [fs→IOR Migration PDCA](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- **Down:**
  - [ ] [Task 5.1: Developer - IOR Pattern Analysis](./task-5.1-developer-ior-analysis.md)
  - [ ] [Task 5.2: Developer - IOR Implementation](./task-5.2-developer-ior-implementation.md)
  - [ ] [Task 5.3: Developer - Async Method Migration](./task-5.3-developer-async-migration.md)

---

## **What** (WODA)
Migrate 4 fs calls in DefaultUnit to IOR.load() / IOR.save() pattern, establishing the reference implementation for IOR-based resource access across ONCE.

## **Overview** (WODA)
- **Priority:** 2 (High - IOR Pattern Adoption)
- **Estimated Time:** 1 hour
- **Current State:** DefaultUnit uses fs.readFileSync() for metadata, mixed fs/IOR usage
- **Target State:** 100% IOR-based resource access via IOR.load()/IOR.save()
- **Progress:** Web4 IOR Infrastructure 10% → 20% after completion

## Context
DefaultUnit currently reads component metadata (package.json, component.json, etc.) using synchronous fs calls. This creates a blocking operation and couples the code to Node.js file system, violating P34 (IOR as Unified Entry Point). The small, focused scope (4 fs calls) makes DefaultUnit the ideal first migration target to establish patterns for larger migrations (Task 6 with 32+ calls).

## Intention
Create Web4 compliant resource access using IOR abstraction layer. Enable DefaultUnit to work seamlessly in both Node.js and browser contexts through IOR virtualization. Establish the reference pattern for DefaultWeb4TSComponent (Task 6) and future component migrations.

---

## **Details** (WODA)

### Files to Modify:
| File | Purpose | fs calls to migrate |
|------|---------|---------------------|
| `layer2/DefaultUnit.ts` | Unit initialization, metadata loading | 4 |
| `test/*Unit*` | Unit test updates for async API | 2-3 test calls |

### Technical Specifications (Complete Code)

**Current State (OLD - fs-based):**
```typescript
// File: components/ONCE/0.3.22.2/src/layer2/DefaultUnit.ts
import fs from 'fs';

export class DefaultUnit implements Unit {
  model!: UnitModel;

  init(scenario: Scenario<UnitModel>): this {
    this.model = scenario.model;

    // OLD (fs-based, blocking):
    const packageJson = JSON.parse(
      fs.readFileSync('package.json', 'utf8')
    );
    const componentJson = JSON.parse(
      fs.readFileSync('component.json', 'utf8')
    );

    if (fs.existsSync('tsconfig.json')) {
      const tsconfig = JSON.parse(
        fs.readFileSync('tsconfig.json', 'utf8')
      );
      this.model.config = tsconfig;
    }

    return this;
  }
}
```

**Target State (NEW - IOR-based):**
```typescript
// File: components/ONCE/0.3.22.2/src/layer2/DefaultUnit.ts
import { IOR } from '../layer3/IOR.interface';

export class DefaultUnit implements Unit {
  model!: UnitModel;
  private ior!: IOR;

  init(scenario: Scenario<UnitModel>): this {
    this.model = scenario.model;
    return this;
  }

  // Convert to async for IOR support
  async loadMetadata(): Promise<this> {
    // NEW (IOR-based, abstracted):
    const packageJson = JSON.parse(
      await this.ior.load('package.json')
    );
    const componentJson = JSON.parse(
      await this.ior.load('component.json')
    );

    try {
      const tsconfig = JSON.parse(
        await this.ior.load('tsconfig.json')
      );
      this.model.config = tsconfig;
    } catch (e) {
      // File doesn't exist - IOR throws instead of returning false
      this.model.config = undefined;
    }

    return this;
  }
}
```

**IOR Load/Save Pattern:**
```typescript
// PATTERN: File Read
// OLD: const data = JSON.parse(fs.readFileSync(path, 'utf8'));
// NEW:
const data = JSON.parse(await IOR.load(path));

// PATTERN: File Write
// OLD: fs.writeFileSync(path, JSON.stringify(data));
// NEW:
await IOR.save(path, JSON.stringify(data));

// PATTERN: Existence Check
// OLD: if (fs.existsSync(path)) { ... }
// NEW:
try {
  await IOR.load(path);
  // File exists
} catch (e) {
  // File doesn't exist
}
```

---

## **Actions** (WODA)

### 1. Identify fs Calls in DefaultUnit
- [ ] Scan DefaultUnit.ts for all fs.* calls
- [ ] Document purpose of each call (read vs write, blocking vs async)
- [ ] Verify count matches 4 expected calls
- [ ] Identify all fs module imports to remove

### 2. Replace with IOR Pattern
- [ ] Replace all `fs.readFileSync()` calls with `await IOR.load(path)`
- [ ] Replace any `fs.writeFileSync()` calls with `await IOR.save(path, content)`
- [ ] Replace `fs.existsSync()` checks with try/catch around IOR.load()
- [ ] Remove fs module import from DefaultUnit.ts

### 3. Update Method Signatures to Async
- [ ] Identify methods that perform file I/O
- [ ] Convert sync methods to async (e.g., `init()` → async if needed)
- [ ] Update return types from `this` to `Promise<this>`
- [ ] Ensure proper await usage in all calling code
- [ ] Update type signatures in tests

### 4. Update Tests for Async API
- [ ] Update test calls to use await for async methods
- [ ] Verify all unit tests passing with async API
- [ ] Add test for IOR existence check (try/catch pattern)
- [ ] No regressions in unit operations

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_IOR0005_DefaultUnitMigration.ts
const req = this.requirement('IOR.0005 DefaultUnit Migration', 'IOR.load()/save() replaces fs.*');
req.addCriterion('AC-01', 'All 4 fs.* calls replaced with IOR methods');
req.addCriterion('AC-02', 'IOR abstraction enables Node.js and browser contexts');
req.addCriterion('AC-03', 'Async/await properly implemented in all methods');
req.addCriterion('AC-04', 'Zero fs module imports remaining in DefaultUnit');
```

- [ ] **AC-01:** All 4 fs.* calls replaced with IOR.load()/IOR.save()
- [ ] **AC-02:** DefaultUnit works with IOR abstraction (browser/Node.js agnostic)
- [ ] **AC-03:** All file I/O methods properly async with correct signatures
- [ ] **AC-04:** Zero fs module imports in DefaultUnit.ts
- [ ] **AC-05:** Unit tests passing (90%+ coverage maintained)
- [ ] **AC-06:** Manual test: DefaultUnit loads metadata correctly
- [ ] **AC-07:** Manual test: IOR pattern verified for Task 6 reference

---

## Dependencies

### Prerequisites:
- ✅ IOR Infrastructure I.1-I.6 (85% complete)
- ✅ IOR.load() / IOR.save() API stabilized
- 🔵 Task 4 (R.2-R.6 Research) - recommended but not blocking

### Blocks:
- None (parallel work possible)

### Enables:
- 🟢 Task 6 (DefaultWeb4TSComponent IOR migration - 32 calls)
- 🟢 IOR pattern reference for all future component migrations

---

## Definition of Done

- [ ] All 4 fs calls replaced with IOR methods
- [ ] fs module import removed from DefaultUnit.ts
- [ ] All methods properly async with correct signatures
- [ ] All unit tests passing with 90%+ coverage
- [ ] Manual test: DefaultUnit metadata loading works
- [ ] Manual test: IOR pattern verified and documented
- [ ] Tootsie tests with Web4Requirement passing
- [ ] PDCA entry updated with results
- [ ] Code reviewed and merged to dev/claudeFlow.v1

---

## QA Audit & User Feedback

### TRON Requirements - DefaultUnit IOR Migration
```quote
Migrate 4 fs calls in DefaultUnit to IOR.load() / IOR.save() pattern, establishing reference implementation for IOR-based resource access
```

- **Issue:** DefaultUnit couples to Node.js fs API, blocks browser compatibility
- **Resolution:** IOR abstraction virtualizes all resource access
- **Pattern:** Radical OOP with IOR.load()/IOR.save() (P34 compliant)

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (metadata in unit model)
- [ ] **P6:** Empty Constructor + init(scenario)
- [ ] **P34:** IOR as Unified Entry Point (replaces direct fs calls)
- [ ] **P25:** Tootsie Tests Only (Web4Requirement based)

---

## Related Documents

- [PDCA: fs→IOR Migration](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- [PDCA: IOR Infrastructure](../../components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md)
- [PDCA: Iteration Tracking](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - IOR.0005 DefaultUnit IOR Migration*
*Priority: High - IOR Pattern Adoption & Reference Implementation*
*Pattern: Radical OOP with IOR Abstraction Layer (P34)*
