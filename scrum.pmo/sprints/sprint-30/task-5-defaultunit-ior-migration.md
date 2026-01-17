# Task 5: DefaultUnit IOR Migration

**Status:** 📋 PLANNED
**Priority:** 2 (High - IOR Pattern Adoption)
**Estimated Time:** 1 hour
**Assignee:** TBD
**Sprint:** 30

---

## **Objective**

Migrate 4 fs calls in DefaultUnit to IOR.load() / IOR.save() pattern, establishing the reference implementation for IOR-based resource access.

---

## **Background**

From [2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md):

**Current State:**
- DefaultUnit has ~4 fs calls for reading component metadata
- Uses fs.readFileSync() for package.json, component.json, etc.
- Small, focused scope makes it ideal first migration target

**Target State:**
- All resource loads via IOR.load()
- All resource saves via IOR.save()
- Pattern established for larger migrations (Task 6)

---

## **Requirements**

### **1. Identify fs Calls in DefaultUnit**
- [ ] Scan DefaultUnit.ts for all fs.* calls
- [ ] Document purpose of each call
- [ ] Determine if read-only or read-write

Expected calls:
- `fs.readFileSync('package.json')`
- `fs.readFileSync('component.json')`
- `fs.readFileSync('tsconfig.json')`
- `fs.existsSync(...)` checks

### **2. Replace with IOR Pattern**
- [ ] Replace `fs.readFileSync()` with `await IOR.load(path)`
- [ ] Replace `fs.writeFileSync()` with `await IOR.save(path, content)`
- [ ] Replace `fs.existsSync()` with IOR existence check
- [ ] Convert methods to async if needed

### **3. Update Method Signatures**
- [ ] Convert sync methods to async
- [ ] Update return types to Promise<T>
- [ ] Ensure proper await usage throughout
- [ ] Update calling code in test files

---

## **Acceptance Criteria**

1. **Code Quality:**
   - Zero fs.* calls in DefaultUnit.ts
   - All resource loads via IOR.load()
   - All resource saves via IOR.save()
   - Proper async/await usage

2. **Functionality:**
   - All existing tests passing
   - No regressions in unit operations
   - Performance comparable to previous

3. **Pattern Establishment:**
   - Clear IOR pattern for Task 6 to follow
   - Code comments explain IOR usage
   - Example for other components

4. **Documentation:**
   - PDCA entry updated with migration details
   - Pattern documented for reference
   - Lessons learned captured

---

## **Technical Approach**

### **Migration Pattern:**

**File Read (OLD):**
```typescript
const packageJson = JSON.parse(
  fs.readFileSync('package.json', 'utf8')
);
```

**File Read (NEW with IOR):**
```typescript
const packageJson = JSON.parse(
  await IOR.load('package.json')
);
```

**File Write (OLD):**
```typescript
fs.writeFileSync(
  'component.json',
  JSON.stringify(componentData, null, 2)
);
```

**File Write (NEW with IOR):**
```typescript
await IOR.save(
  'component.json',
  JSON.stringify(componentData, null, 2)
);
```

**Existence Check (OLD):**
```typescript
if (fs.existsSync(path)) { ... }
```

**Existence Check (NEW with IOR):**
```typescript
try {
  await IOR.load(path);
  // exists
} catch {
  // doesn't exist
}
```

---

## **Dependencies**

### **Prerequisites:**
- ✅ IOR Infrastructure I.1-I.6 (85% complete)
- 🔵 Task 4 (R.2-R.6 Research) - recommended but not blocking

### **Blocks:**
- None (parallel work possible)

### **Enables:**
- 🟢 Task 6 (DefaultWeb4TSComponent migration)
- 🟢 IOR pattern reference for other components

---

## **Files to Modify**

- `components/ONCE/0.3.22.2/src/layer2/DefaultUnit.ts` (primary)
- `components/ONCE/0.3.22.2/test/*Unit*` (test updates for async)

---

## **Definition of Done**

- [ ] All 4 fs calls replaced with IOR methods
- [ ] fs module import removed from DefaultUnit.ts
- [ ] All methods properly async with correct signatures
- [ ] All unit tests passing
- [ ] Manual test: unit operations work correctly
- [ ] Pattern documented in PDCA
- [ ] Code reviewed and merged

---

## **Related Documents**

- [PDCA: fs→IOR Migration](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- [PDCA: IOR Infrastructure](../../components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md)
- [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)

---

## **Notes**

- Small scope (4 calls) makes this quick win
- Establishes pattern for larger Task 6 migration
- Should complete in ~1h if IOR infrastructure stable
- Good opportunity to verify IOR.load()/save() API design

---

**Created:** 2026-01-17
**Last Updated:** 2026-01-17
**Sprint:** [Sprint 30 Planning](./planning.md)
