# Task 2: FFM.4b ServerHierarchyManager Remaining fs Calls

**Status:** 📋 PLANNED
**Priority:** 1 (Critical - Complete OOP Migration)
**Estimated Time:** 4 hours
**Assignee:** TBD
**Sprint:** 30

---

## **Objective**

Migrate remaining ServerHierarchyManager fs calls to File/Folder OOP methods, completing the migration started in FFM.4a.

---

## **Background**

From iteration tracking PDCA:

**Current State:**
- ServerHierarchyManager has ~27 fs calls remaining (from original 99)
- Mix of existsSync, readdirSync, readFileSync, writeFileSync
- Critical component for scenario hierarchy management

**Target State:**
- 100% OOP File/Folder method usage
- No fs module imports in ServerHierarchyManager
- Consistent pattern with FFM.4a scenario housekeeping

---

## **Requirements**

### **1. Inventory Remaining fs Calls**
- [ ] Scan ServerHierarchyManager.ts for all fs.* calls
- [ ] Categorize by operation type (exists, read, write, list)
- [ ] Document purpose of each call

### **2. Replace with OOP Methods**
- [ ] `existsSync()` → `folder.exists()` / `file.exists()`
- [ ] `readdirSync()` → `folder.list()`
- [ ] `readFileSync()` → `file.read()` (async)
- [ ] `writeFileSync()` → `file.write()` (async)
- [ ] `statSync()` → `file.stat()` / `folder.stat()`

### **3. Async Migration**
- [ ] Convert synchronous methods to async where needed
- [ ] Update method signatures to return Promise<T>
- [ ] Ensure proper await usage throughout call chain
- [ ] Update tests to handle async operations

---

## **Acceptance Criteria**

1. **Code Quality:**
   - Zero fs.* calls in ServerHierarchyManager.ts
   - No fs module imports
   - All file operations use File/Folder classes

2. **Functionality:**
   - All existing tests passing
   - No regressions in scenario hierarchy management
   - Performance comparable to previous implementation

3. **Testing:**
   - Unit tests updated for async operations
   - Integration tests verify hierarchy operations
   - Manual test: create/delete/list hierarchies

4. **Documentation:**
   - PDCA entry updated
   - Migration patterns documented
   - Code comments explain async conversions

---

## **Technical Approach**

### **Expected fs Call Patterns:**

**Hierarchy Existence Check:**
```typescript
// OLD:
if (fs.existsSync(hierarchyPath)) { ... }

// NEW:
const hierarchyFolder = await Folder.init({ path: hierarchyPath });
if (await hierarchyFolder.exists()) { ... }
```

**Directory Listing:**
```typescript
// OLD:
const items = fs.readdirSync(hierarchyPath);

// NEW:
const hierarchyFolder = await Folder.init({ path: hierarchyPath });
const items = await hierarchyFolder.list();
```

**File Read:**
```typescript
// OLD:
const content = fs.readFileSync(configPath, 'utf8');

// NEW:
const configFile = await File.init({ path: configPath });
const content = await configFile.read();
```

---

## **Dependencies**

### **Prerequisites:**
- ✅ FFM.0-FFM.3.6 complete (File/Folder OOP foundation)
- 🔵 Task 1 (FFM.4a Scenario Housekeeping) - pattern established

### **Blocks:**
- 🔵 Task 3 (FFM.5-FFM.7 final fs migration)

---

## **Files to Modify**

- `components/ONCE/0.3.22.2/src/layer2/ServerHierarchyManager.ts` (primary)
- `components/ONCE/0.3.22.2/test/*ServerHierarchyManager*` (tests)
- Any calling code that needs async updates

---

## **Definition of Done**

- [ ] All 27 fs calls replaced with OOP methods
- [ ] fs module completely removed from ServerHierarchyManager
- [ ] All methods properly async with correct Promise types
- [ ] All tests passing (unit + integration)
- [ ] Manual testing verified
- [ ] PDCA entry updated
- [ ] Code reviewed and merged

---

## **Related Documents**

- [PDCA: File/Folder Architecture](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- [PDCA: Scenario Housekeeping](../../components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md)
- [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)

---

## **Notes**

- ServerHierarchyManager is central to ONCE architecture
- Async migration may require updates to calling code
- Should complete quickly after FFM.4a pattern is established
- Test thoroughly - hierarchy bugs are hard to debug

---

**Created:** 2026-01-17
**Last Updated:** 2026-01-17
**Sprint:** [Sprint 30 Planning](./planning.md)
