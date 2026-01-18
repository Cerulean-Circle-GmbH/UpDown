[Back to Planning Sprint 30](./planning.md)

# Task 2: FFM.4b ServerHierarchyManager fs→IOR Cleanup
[task:uuid:FFM4B-0002-2026-0118-SERVERHIERARCHY-CLEANUP]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-2.1-developer-fs-inventory.md`)
- Subtasks must always indicate the affected role in the filename.
- Subtasks must be ordered to avoid blocking dependencies.

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] fs call inventory
  - [ ] creating test cases
  - [ ] implementing migrations
  - [ ] testing async changes
- [ ] QA Review
- [ ] Done

## Traceability
- Source: File/Folder Architecture Completion - ServerHierarchyManager OOP Migration
- **Up:**
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
  - [File/Folder Architecture PDCA](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- **Down:**
  - [ ] [Task 2.1: Developer - fs Call Inventory](./task-2.1-developer-fs-inventory.md)
  - [ ] [Task 2.2: Developer - File/Folder Migration](./task-2.2-developer-file-folder-migration.md)
  - [ ] [Task 2.3: Developer - Async Method Updates](./task-2.3-developer-async-migration.md)

---

## **What** (WODA)
Migrate remaining 27 fs calls from ServerHierarchyManager to File/Folder OOP methods, completing the FFM.4a pattern and establishing consistency across hierarchy operations.

## **Overview** (WODA)
- **Priority:** 1 (Critical - Complete OOP Migration)
- **Estimated Time:** 4 hours
- **Current State:** ServerHierarchyManager has ~27 fs calls remaining (mix of existsSync, readdirSync, readFileSync, writeFileSync)
- **Target State:** 100% OOP File/Folder method usage, no fs imports
- **Progress:** File/Folder Architecture 85% → 92% after completion

## Context
ServerHierarchyManager is the central component for scenario hierarchy operations in ONCE. It currently mixes direct fs module calls with OOP methods, creating inconsistency and violating P34 (IOR as Unified Entry Point). This task completes the FFM.4a pattern and unblocks FFM.5-FFM.7 migrations.

## Intention
Apply established FFM.4a patterns to the remaining ServerHierarchyManager fs calls. Create async method signatures that maintain Web4 Radical OOP compliance while enabling proper file system abstraction through File/Folder classes. Establish the reference pattern for distributed hierarchy operations.

---

## **Details** (WODA)

### Files to Modify:
| File | Purpose | fs calls to migrate |
|------|---------|---------------------|
| `layer2/ServerHierarchyManager.ts` | Hierarchy management | ~27 |
| `test/*ServerHierarchyManager*` | Unit/integration tests | async updates |
| Calling code in orchestrators | Call site updates | async handling |

### Technical Specifications (Complete Code)

**Pattern to Follow (from FFM.4a):**
```typescript
// OLD (fs-based - violates P34):
if (fs.existsSync(hierarchyPath)) {
  const items = fs.readdirSync(hierarchyPath);
  const config = fs.readFileSync(configPath, 'utf8');
}

// NEW (OOP IOR - P34 compliant):
const hierarchyFolder = await new Folder().init({ path: hierarchyPath });
if (await hierarchyFolder.exists()) {
  const items = await hierarchyFolder.list();
  const configFile = await new File().init({ path: configPath });
  const config = await configFile.read();
}
```

**Async Wrapper Pattern:**
```typescript
// OLD (synchronous):
public getHierarchyConfig(path: string): Config {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

// NEW (async with Promise<this>):
public async getHierarchyConfig(path: string): Promise<Config> {
  const file = await new File().init({ path });
  return JSON.parse(await file.read());
}
```

**fs Call Mapping:**
| fs Call | OOP Replacement | Return Type |
|---------|-----------------|-------------|
| `fs.existsSync()` | `file/folder.exists()` | Promise<boolean> |
| `fs.readdirSync()` | `folder.list()` | Promise<string[]> |
| `fs.readFileSync()` | `file.read()` | Promise<string> |
| `fs.writeFileSync()` | `file.write()` | Promise<this> |
| `fs.statSync()` | `file/folder.stat()` | Promise<Stats> |

---

## **Actions** (WODA)

### 1. Inventory fs Calls
- [ ] Scan ServerHierarchyManager.ts for all fs.* calls (expect ~27)
- [ ] Categorize by operation: exists, read, write, list, stat
- [ ] Document calling context and data flow
- [ ] Identify async call chain impacts

### 2. Replace with File/Folder OOP Methods
- [ ] `existsSync()` → `folder.exists()` / `file.exists()`
- [ ] `readdirSync()` → `folder.list()`
- [ ] `readFileSync()` → `file.read()`
- [ ] `writeFileSync()` → `file.write()`
- [ ] `statSync()` → `file.stat()` / `folder.stat()`
- [ ] Remove all fs imports

### 3. Async Method Updates
- [ ] Convert all methods to async where fs calls present
- [ ] Update method signatures to return Promise<T>
- [ ] Ensure proper await usage in call chain
- [ ] Update all calling code with await
- [ ] Handle error cases with proper try/catch

### 4. Testing Updates
- [ ] Update unit tests for async methods
- [ ] Create integration tests for hierarchy operations
- [ ] Manual test: create/list/delete hierarchies
- [ ] Verify no performance regression

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_FFM4b_ServerHierarchyManager.ts
const req = this.requirement('FFM.4b ServerHierarchyManager', 'Complete fs→OOP migration');
req.addCriterion('AC-01', 'Zero fs.* calls in ServerHierarchyManager');
req.addCriterion('AC-02', 'All methods using File/Folder OOP classes');
req.addCriterion('AC-03', 'All methods async with proper Promise types');
req.addCriterion('AC-04', 'All calling code updated with await');
req.addCriterion('AC-05', 'Unit tests passing (90%+ coverage)');
req.addCriterion('AC-06', 'Integration tests verify hierarchy operations');
```

- [ ] **AC-01:** Zero fs.* calls in ServerHierarchyManager.ts
- [ ] **AC-02:** All file operations use File/Folder OOP classes
- [ ] **AC-03:** All methods async with correct Promise<T> types
- [ ] **AC-04:** All call sites updated with async/await
- [ ] **AC-05:** Unit tests passing (90%+ coverage)
- [ ] **AC-06:** Integration tests verify hierarchy operations
- [ ] **AC-07:** Manual test: create/list/delete hierarchies
- [ ] **AC-08:** Performance verified (no regression)

---

## Dependencies

### Prerequisites:
- ✅ FFM.0-FFM.3.6 complete (File/Folder OOP foundation exists)
- ✅ File/Folder classes ready in layer2
- 🔵 Task 1 (FFM.4a Scenario Housekeeping) - pattern established

### Blocks:
- 🔵 Task 3 (FFM.5-FFM.7 final fs migration)

---

## Definition of Done

- [ ] All 27 fs calls replaced with OOP methods
- [ ] fs module completely removed from ServerHierarchyManager
- [ ] All methods properly async with correct Promise types
- [ ] All call sites updated with proper await handling
- [ ] Tootsie tests with Web4Requirement passing
- [ ] Integration tests passing
- [ ] Manual testing verified
- [ ] PDCA entry updated with results
- [ ] Code reviewed and merged to dev/claudeFlow.v1

---

## QA Audit & User Feedback

### TRON Requirements - ServerHierarchyManager fs Migration
```quote
Complete fs→OOP migration for ServerHierarchyManager following FFM.4a pattern.
Enable async hierarchy operations while maintaining Web4 Radical OOP compliance.
```

- **Issue:** ServerHierarchyManager mixes fs calls with OOP methods (P34 violation)
- **Resolution:** Replace all fs calls with File/Folder OOP methods per FFM.4a pattern
- **Pattern:** Async methods returning Promise<T>, Radical OOP (P34 compliant)

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (hierarchy in scenario model)
- [ ] **P6:** Empty Constructor + init(scenario)
- [ ] **P34:** IOR as Unified Entry Point (File/Folder OOP only)
- [ ] **P25:** Tootsie Tests Only (Web4Requirement based)
- [ ] **P14:** All methods async/Promise-based (no synchronous fs calls)

---

## Related Documents

- [PDCA: File/Folder Architecture](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- [PDCA: Scenario Housekeeping Migration](../../components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md)
- [PDCA: Iteration Tracking](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - FFM.4b ServerHierarchyManager fs→IOR Cleanup*
*Priority: Critical - Complete OOP Migration Pattern*
*Depends on: Task 1 (FFM.4a Pattern Established)*
*Pattern: Async Radical OOP with File/Folder IOR Methods*
