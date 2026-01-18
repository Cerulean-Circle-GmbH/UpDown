[Back to Planning Sprint 30](./planning.md)

# Task 6: IOR.4b DefaultWeb4TSComponent IOR Migration
[task:uuid:IOR-0006-2026-0118-WEB4TSCOMP-MIGRATION]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-6.1-developer-metadata-migration.md`)
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
- Source: IOR Infrastructure Completion - DefaultWeb4TSComponent IOR Migration
- **Up:**
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
  - [IOR Infrastructure PDCA](../../components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md)
  - [fs→IOR Migration PDCA](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- **Down:**
  - [ ] [Task 6.1: Developer - Metadata Reads Migration](./task-6.1-developer-metadata-migration.md)
  - [ ] [Task 6.2: Developer - Configuration Reads Migration](./task-6.2-developer-config-migration.md)
  - [ ] [Task 6.3: Developer - Directory Operations Migration](./task-6.3-developer-directory-migration.md)
  - [ ] [Task 6.4: Developer - File Writes Migration](./task-6.4-developer-writes-migration.md)

---

## **What** (WODA)
Migrate 32 fs calls in DefaultWeb4TSComponent to IOR.load() / IOR.save() pattern, completing the largest single-file migration in the IOR Infrastructure initiative.

## **Overview** (WODA)
- **Priority:** 2 (High - Largest Migration, Critical Meta-Component)
- **Estimated Time:** 6 hours
- **Current State:** DefaultWeb4TSComponent uses 32 fs.* calls (largest file), mixed JSON/config operations
- **Target State:** 100% IOR-based resource access, zero fs module usage
- **Progress:** IOR Infrastructure 85% → 92% after completion
- **Depends On:** Task 5 (DefaultUnit IOR Migration - pattern reference)

## Context
DefaultWeb4TSComponent is the core meta-component for the Web4TSComponent framework, handling component lifecycle, descriptor generation, and CLI operations. The 32 fs calls across metadata reads, configuration access, directory operations, and file writes create a large migration surface. This task completes the pattern established in Task 5 at production scale.

## Intention
Apply IOR infrastructure at scale to the largest remaining fs-dependent component. Establish confidence in IOR.load()/IOR.save() patterns for critical framework code. Enable complete fs→IOR migration across all components by proving pattern effectiveness on real codebase complexity.

---

## **Details** (WODA)

### Files to Modify:
| File | Purpose | fs calls to migrate |
|------|---------|---------------------|
| `components/Web4TSComponent/*/src/layer2/DefaultWeb4TSComponent.ts` | Component lifecycle, descriptor generation | ~32 |
| `components/Web4TSComponent/*/test/*Web4TSComponent*.ts` | Unit and integration tests | ~8 |
| `components/Web4TSComponent/*/src/layer5/*CLI.ts` | CLI command entry points | ~3 |

### Technical Specifications (Complete Code)

**Phase 1 Pattern - Metadata Reads:**
```typescript
// OLD (fs-based, violates P34):
const componentJson = JSON.parse(
  fs.readFileSync('component.json', 'utf8')
);
const packageJson = JSON.parse(
  fs.readFileSync('package.json', 'utf8')
);

// NEW (IOR-based, P34 compliant):
const componentJson = JSON.parse(
  await IOR.load('component.json')
);
const packageJson = JSON.parse(
  await IOR.load('package.json')
);
```

**Phase 2 Pattern - Configuration Reads:**
```typescript
// OLD (fs-based, violates P34):
if (fs.existsSync('tsconfig.json')) {
  const tsconfig = JSON.parse(
    fs.readFileSync('tsconfig.json', 'utf8')
  );
}

// NEW (IOR-based, P34 compliant):
const file = await new File().init({ path: 'tsconfig.json' });
if (await file.exists()) {
  const tsconfig = JSON.parse(
    await IOR.load('tsconfig.json')
  );
}
```

**Phase 3 Pattern - Directory Operations:**
```typescript
// OLD (fs-based, violates P34):
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  const filtered = files.filter(f => f.endsWith('.ts'));
}

// NEW (IOR-based, P34 compliant):
const folder = await new Folder().init({ path: dir });
if (await folder.exists()) {
  const files = await folder.list();
  const filtered = files.filter(f => f.endsWith('.ts'));
}
```

**Phase 4 Pattern - File Writes:**
```typescript
// OLD (fs-based, violates P34):
fs.writeFileSync(
  'component.json',
  JSON.stringify(descriptor, null, 2)
);

// NEW (IOR-based, P34 compliant):
await IOR.save(
  'component.json',
  JSON.stringify(descriptor, null, 2)
);
```

**Async Propagation Pattern:**
```typescript
// OLD (sync operations):
generateDescriptor(): void {
  const config = this.readConfig();
  this.writeDescriptor(config);
}

// NEW (async operations, P6 compliant):
async generateDescriptor(): Promise<this> {
  const config = await this.readConfig();
  await this.writeDescriptor(config);
  return this;
}
```

---

## **Actions** (WODA)

### 1. Comprehensive fs Call Inventory
- [ ] Scan DefaultWeb4TSComponent.ts for all fs.* calls
- [ ] Categorize by operation type and purpose
- [ ] Group similar operations for batch migration
- [ ] Document call patterns and dependencies

### 2. Metadata Reads Migration (~8 calls, 1.5h)
- [ ] Migrate component.json reads to IOR.load()
- [ ] Migrate package.json reads to IOR.load()
- [ ] Convert methods to async with Promise<T> signature
- [ ] Update all callers to use await
- [ ] Add unit tests for metadata read operations
- [ ] Verify no performance regression

### 3. Configuration Reads Migration (~6 calls, 1h)
- [ ] Migrate tsconfig.json reads to IOR.load()
- [ ] Migrate eslint config reads to IOR.load()
- [ ] Replace fs.existsSync() with folder.exists() checks
- [ ] Convert methods to async
- [ ] Update all callers
- [ ] Add unit tests for config operations

### 4. Directory Operations Migration (~10 calls, 2h)
- [ ] Replace fs.readdirSync() with folder.list()
- [ ] Replace fs.existsSync(dir) with folder.exists()
- [ ] Replace fs.statSync() with file.stat()
- [ ] Replace fs.mkdirSync() with folder.create()
- [ ] Convert methods to async
- [ ] Update all callers
- [ ] Add integration tests

### 5. File Writes Migration (~8 calls, 1.5h)
- [ ] Replace fs.writeFileSync() with IOR.save()
- [ ] Replace fs.appendFileSync() with IOR.append()
- [ ] Replace fs.unlinkSync() with file.delete()
- [ ] Convert methods to async
- [ ] Update all callers
- [ ] Add tests for write operations

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_IOR4b_DefaultWeb4TSComponent.ts
const req = this.requirement('IOR.4b DefaultWeb4TSComponent IOR Migration', 'Complete fs→IOR migration for meta-component');
req.addCriterion('AC-01', 'Zero fs.* calls in DefaultWeb4TSComponent');
req.addCriterion('AC-02', 'All metadata reads via IOR.load()');
req.addCriterion('AC-03', 'All file operations async with proper await');
req.addCriterion('AC-04', 'Directory operations use Folder/File classes');
req.addCriterion('AC-05', 'All methods return Promise<this> for chaining');
req.addCriterion('AC-06', 'Component generation works end-to-end');
```

- [ ] **AC-01:** Zero fs.* calls in DefaultWeb4TSComponent.ts
- [ ] **AC-02:** All metadata reads (component.json, package.json) via IOR.load()
- [ ] **AC-03:** All configuration reads (tsconfig.json, eslint) via IOR.load()
- [ ] **AC-04:** All directory operations use Folder/File OOP classes
- [ ] **AC-05:** All methods properly async with Promise<T> signature
- [ ] **AC-06:** All methods return `this` for method chaining
- [ ] **AC-07:** Unit tests passing (90%+ coverage)
- [ ] **AC-08:** Integration tests passing (component create/build/test workflows)
- [ ] **AC-09:** Manual test: Create component via CLI, verify descriptor
- [ ] **AC-10:** Manual test: Build component, verify all operations succeed
- [ ] **AC-11:** Performance benchmarks comparable to fs (within 10%)
- [ ] **AC-12:** No performance regressions in existing workflows

---

## Dependencies

### Prerequisites:
- ✅ IOR Infrastructure I.1-I.6 (85% complete)
- ✅ File/Folder OOP classes available in layer2
- 🔵 Task 5 (DefaultUnit IOR Migration) - pattern reference complete

### Blocks:
- 🔵 Future component migrations (will reference this as pattern)
- 🔵 Removal of fs module dependency (project-wide goal)

### May Impact:
- Other components calling DefaultWeb4TSComponent methods
- CLI commands using component methods
- Build scripts invoking component operations
- Component generation workflows

---

## Definition of Done

- [ ] All 32 fs calls replaced with IOR methods
- [ ] fs module completely removed from DefaultWeb4TSComponent
- [ ] All methods properly async with Promise<T> return type
- [ ] All methods return `this` for chaining (P6 compliant)
- [ ] Tootsie tests with Web4Requirement passing
- [ ] Unit tests passing (100%)
- [ ] Integration tests passing
- [ ] Manual testing verified (create/build/test workflows)
- [ ] Performance benchmarks within acceptable range
- [ ] PDCA entry updated with results and learnings
- [ ] Code reviewed and merged to dev/claudeFlow.v1

---

## QA Audit & User Feedback

### TRON Requirements - IOR Migration
```quote
Migrate 32 fs calls in DefaultWeb4TSComponent to IOR.load() / IOR.save() pattern.
Complete largest single-file migration with zero fs module usage.
```

- **Issue:** DefaultWeb4TSComponent uses 32 fs.* calls (largest file in codebase)
- **Resolution:** Systematic migration via IOR infrastructure, incremental by operation type
- **Pattern:** IOR.load()/IOR.save() with Folder/File OOP classes (P34 compliant)
- **Scale:** Largest IOR migration to date, proves pattern at production scale

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (file/folder models in IOR)
- [ ] **P6:** Empty Constructor + init(scenario) (Folder/File classes)
- [ ] **P34:** IOR as Unified Entry Point (replacing all fs.* calls)
- [ ] **P25:** Tootsie Tests Only (Web4Requirement based)

---

## Related Documents

- [PDCA: IOR Infrastructure](../../components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md)
- [PDCA: fs→IOR Migration](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [Web4 Component Anatomy Checklist](../../components/ONCE/0.3.22.1/session/web4-component-anatomy-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - IOR.4b DefaultWeb4TSComponent IOR Migration*
*Priority: High - Largest Migration (32 fs calls)*
*Pattern: IOR.load()/IOR.save() with Folder/File OOP Classes*
*Goal: Complete fs→IOR at production scale, establish confidence for remaining components*
