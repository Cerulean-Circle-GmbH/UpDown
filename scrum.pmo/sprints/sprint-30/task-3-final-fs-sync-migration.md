# Task 3: FFM.5-FFM.7 Final fs Sync Call Migration

**Status:** 📋 PLANNED
**Priority:** 1 (Critical - 100% OOP Achievement)
**Estimated Time:** 9 hours
**Assignee:** TBD
**Sprint:** 30

---

## **Objective**

Eliminate all remaining ~80 sync fs calls across the codebase, achieving 100% File/Folder OOP architecture completion. This is the final step in the File/Folder Architecture PDCA (72% → 100%).

---

## **Background**

From iteration tracking PDCA:

**Current State:**
- ~80 fs.*Sync() calls remain across multiple files
- Scattered in DefaultUnit, DefaultWeb4TSComponent, and other components
- Mix of existsSync, readdirSync, readFileSync, writeFileSync, statSync

**Target State:**
- **ZERO** fs.*Sync() calls in entire codebase
- 100% OOP File/Folder method usage
- File/Folder Architecture PDCA marked complete

---

## **Requirements**

### **1. Comprehensive fs Call Audit**
- [ ] Scan entire src/ directory for all fs.*Sync() calls
- [ ] Create inventory by file and operation type
- [ ] Prioritize by file (largest impact first)

### **2. Migration by File**
Per the tracking PDCA estimate:

#### **DefaultUnit (~4 calls) - 1h**
- [ ] Migrate all fs calls to IOR.load() / IOR.save() pattern
- [ ] Use File/Folder OOP methods where IOR doesn't apply
- [ ] Update method signatures to async

#### **DefaultWeb4TSComponent (~32 calls) - 6h**
- [ ] Largest migration effort
- [ ] Systematic replacement of all fs operations
- [ ] May need to break into sub-tasks by method
- [ ] Careful testing required (core component)

#### **Remaining Files (~19 calls) - 4h**
- [ ] Smaller files with 1-3 calls each
- [ ] Quick migrations following established patterns
- [ ] Group by similar operation types

### **3. Verification & Cleanup - 2h**
- [ ] Global search confirms zero fs.*Sync() calls
- [ ] Remove all unused fs imports
- [ ] Update ESLint rules to prevent future fs usage
- [ ] Run full test suite

---

## **Acceptance Criteria**

1. **Complete OOP Migration:**
   - Zero fs.*Sync() calls in src/ directory
   - All file operations use File/Folder classes or IOR pattern
   - No fs module imports except in File/Folder base classes

2. **Quality:**
   - All tests passing (unit + integration)
   - No performance regressions
   - Proper async/await usage throughout
   - Error handling matches previous behavior

3. **Verification:**
   - ESLint rule enforcing File/Folder usage
   - Automated check in CI/CD pipeline
   - Documentation updated

4. **Documentation:**
   - FFM PDCA marked 100% complete
   - Migration patterns documented
   - Lessons learned captured

---

## **Technical Approach**

### **Migration Patterns:**

**Simple Existence Check:**
```typescript
// OLD:
if (fs.existsSync(path)) { ... }

// NEW:
const item = await File.init({ path });
if (await item.exists()) { ... }
```

**Directory Listing:**
```typescript
// OLD:
const files = fs.readdirSync(dir);

// NEW:
const folder = await Folder.init({ path: dir });
const files = await folder.list();
```

**File Read (prefer IOR):**
```typescript
// OLD:
const content = fs.readFileSync(path, 'utf8');

// NEW (IOR pattern):
const content = await IOR.load(path);

// OR (File class):
const file = await File.init({ path });
const content = await file.read();
```

### **Async Conversion Strategy:**
1. Convert innermost methods first (leaf nodes)
2. Propagate async up call chain
3. Update method signatures incrementally
4. Test each layer before proceeding

---

## **Dependencies**

### **Prerequisites:**
- ✅ FFM.0-FFM.3.6 complete (File/Folder OOP foundation)
- 🔵 Task 1 (FFM.4a) - pattern established
- 🔵 Task 2 (FFM.4b) - ServerHierarchyManager complete

### **Enables:**
- 🟢 Complete File/Folder Architecture achievement
- 🟢 IOR Infrastructure can proceed without fs conflicts
- 🟢 FFM.8-FFM.9 (Extract File/Folder as separate components)

---

## **Estimated Breakdown**

| File/Component | fs Calls | Time | Notes |
|----------------|----------|------|-------|
| DefaultUnit | ~4 | 1h | Use IOR pattern |
| DefaultWeb4TSComponent | ~32 | 6h | Largest migration, core component |
| Remaining Files | ~19 | 4h | Multiple small files |
| Verification & Cleanup | - | 2h | Testing, ESLint rules |
| **TOTAL** | **~55** | **13h** | Conservative estimate |

**Note:** Original estimate said ~80 calls, but actual may be ~55 based on PDCA breakdown.

---

## **Definition of Done**

- [ ] Zero fs.*Sync() calls in src/ directory (verified by grep)
- [ ] All fs module imports removed (except File/Folder base classes)
- [ ] All tests passing (100% suite)
- [ ] ESLint rule prevents future fs.*Sync() usage
- [ ] Performance benchmarks show no regression
- [ ] PDCA File/Folder Architecture marked 100% complete
- [ ] Code reviewed and merged

---

## **Related Documents**

- [PDCA: File/Folder Architecture](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- [PDCA: fs→IOR Migration](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)

---

## **Risk Mitigation**

**Risks:**
- DefaultWeb4TSComponent is critical - bugs could break entire system
- Async conversion may have cascading effects
- Performance regression in file operations

**Mitigations:**
- Incremental migration with testing after each file
- Comprehensive unit tests before refactoring
- Performance benchmarks before/after
- Feature flag for File/Folder vs fs fallback (temporary)

---

## **Success Celebration**

This task completes a **major architectural milestone**:
- 🎯 100% File/Folder OOP Architecture
- 🎯 Zero fs.*Sync() calls (from 101 original)
- 🎯 Foundation for IOR Infrastructure completion
- 🎯 CMM4 Radical OOP compliance achieved

---

**Created:** 2026-01-17
**Last Updated:** 2026-01-17
**Sprint:** [Sprint 30 Planning](./planning.md)
