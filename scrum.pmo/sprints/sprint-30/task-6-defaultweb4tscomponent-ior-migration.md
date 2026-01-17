# Task 6: DefaultWeb4TSComponent IOR Migration

**Status:** 📋 PLANNED
**Priority:** 2 (High - Largest Migration)
**Estimated Time:** 6 hours
**Assignee:** TBD
**Sprint:** 30

---

## **Objective**

Migrate 32 fs calls in DefaultWeb4TSComponent to IOR.load() / IOR.save() pattern, completing the largest single-file migration in the IOR Infrastructure PDCA.

---

## **Background**

From [2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md):

**Current State:**
- DefaultWeb4TSComponent has ~32 fs calls (largest file)
- Core meta-component for framework functionality
- Mix of component.json, package.json, tsconfig.json operations
- Critical component requiring careful testing

**Target State:**
- 100% IOR-based resource access
- No fs module usage
- Pattern from Task 5 applied at scale

---

## **Requirements**

### **1. Comprehensive fs Call Inventory**
- [ ] Scan DefaultWeb4TSComponent.ts for all fs.* calls
- [ ] Categorize by operation type and purpose
- [ ] Group similar operations for batch migration

Expected categories:
- Component metadata reads (component.json, package.json)
- Configuration reads (tsconfig.json, eslint config)
- Directory operations (exists, list)
- File write operations (descriptor generation)

### **2. Incremental Migration by Method**
- [ ] Break into logical groups by component method
- [ ] Migrate one method at a time
- [ ] Test after each method migration
- [ ] Commit after each successful group

Suggested grouping:
1. **Metadata reads** (~8 calls) - 1.5h
2. **Configuration reads** (~6 calls) - 1h
3. **Directory operations** (~10 calls) - 2h
4. **File writes** (~8 calls) - 1.5h

### **3. Async Conversion**
- [ ] Convert all affected methods to async
- [ ] Update method signatures to Promise<T>
- [ ] Propagate async through call chain
- [ ] Update all callers (may touch other files)

---

## **Acceptance Criteria**

1. **Code Quality:**
   - Zero fs.* calls in DefaultWeb4TSComponent.ts
   - All resource operations via IOR
   - Proper async/await usage throughout
   - No performance regressions

2. **Functionality:**
   - All existing tests passing
   - Component generation works correctly
   - CLI operations function normally
   - Build/test/deploy commands work

3. **Testing:**
   - Unit tests updated for async
   - Integration tests verify component operations
   - Manual tests for critical paths:
     - Component creation
     - Component build
     - Descriptor generation

4. **Documentation:**
   - PDCA entry updated with migration results
   - Complex patterns documented
   - Performance notes captured

---

## **Technical Approach**

### **Migration Strategy:**

**Phase 1: Metadata Reads (1.5h)**
```typescript
// OLD:
const componentJson = JSON.parse(
  fs.readFileSync('component.json', 'utf8')
);

// NEW:
const componentJson = JSON.parse(
  await IOR.load('component.json')
);
```

**Phase 2: Configuration Reads (1h)**
```typescript
// OLD:
const tsconfig = JSON.parse(
  fs.readFileSync('tsconfig.json', 'utf8')
);

// NEW:
const tsconfig = JSON.parse(
  await IOR.load('tsconfig.json')
);
```

**Phase 3: Directory Operations (2h)**
```typescript
// OLD:
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
}

// NEW:
const folder = await Folder.init({ path: dir });
if (await folder.exists()) {
  const files = await folder.list();
}
```

**Phase 4: File Writes (1.5h)**
```typescript
// OLD:
fs.writeFileSync(
  'component.json',
  JSON.stringify(data, null, 2)
);

// NEW:
await IOR.save(
  'component.json',
  JSON.stringify(data, null, 2)
);
```

---

## **Dependencies**

### **Prerequisites:**
- ✅ IOR Infrastructure I.1-I.6 (85% complete)
- 🔵 Task 5 (DefaultUnit IOR Migration) - pattern reference

### **May Impact:**
- Other components that call DefaultWeb4TSComponent
- CLI commands that use component methods
- Build scripts that invoke component operations

---

## **Files to Modify**

**Primary:**
- `components/Web4TSComponent/*/src/layer2/DefaultWeb4TSComponent.ts`

**Tests:**
- `components/Web4TSComponent/*/test/*Web4TSComponent*`

**Possibly:**
- `components/Web4TSComponent/*/src/layer5/*CLI.ts` (if sync calls exist)
- Other components using Web4TSComponent methods

---

## **Risk Mitigation**

**Risks:**
- DefaultWeb4TSComponent is critical - breaks affect all components
- 32 fs calls is large migration surface
- Async conversion may have cascading effects
- Performance regression possible

**Mitigations:**
- Incremental migration by method group
- Test after each group before proceeding
- Keep IOR.load() performance comparable to fs
- Feature branch with comprehensive testing before merge
- Backup rollback plan if issues found

---

## **Testing Strategy**

### **Unit Tests:**
- [ ] Update all Web4TSComponent unit tests for async
- [ ] Verify each migrated method in isolation
- [ ] Mock IOR for fast unit test execution

### **Integration Tests:**
- [ ] Component creation end-to-end
- [ ] Component build process
- [ ] Descriptor generation
- [ ] CLI command execution

### **Manual Tests:**
- [ ] Create new component: `./web4tscomponent create Test 0.1.0.0 all`
- [ ] Build component: `./web4tscomponent on Test 0.1.0.0 build`
- [ ] Run tests: `./web4tscomponent on Test 0.1.0.0 test`
- [ ] Verify descriptor: check component.json correctness

---

## **Definition of Done**

- [ ] All 32 fs calls replaced with IOR methods
- [ ] fs module completely removed from DefaultWeb4TSComponent
- [ ] All methods properly async
- [ ] All unit tests passing (100%)
- [ ] All integration tests passing
- [ ] Manual testing verified (create/build/test)
- [ ] Performance benchmarks acceptable
- [ ] PDCA entry updated
- [ ] Code reviewed and merged

---

## **Related Documents**

- [PDCA: fs→IOR Migration](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- [PDCA: IOR Infrastructure](../../components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md)
- [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)

---

## **Success Celebration**

This task completes the **largest IOR migration**:
- 🎯 32 fs calls → IOR pattern (biggest single file)
- 🎯 Core framework component fully IOR-based
- 🎯 Pattern established for all future components
- 🎯 Major step toward "NO fs functions" goal

---

**Created:** 2026-01-17
**Last Updated:** 2026-01-17
**Sprint:** [Sprint 30 Planning](./planning.md)
