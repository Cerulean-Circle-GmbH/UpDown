# Task 1: FFM.4a Scenario Housekeeping Migration

**Status:** 📋 PLANNED
**Priority:** 1 (Critical - Foundation for fs→IOR Migration)
**Estimated Time:** 8 hours
**Assignee:** TBD
**Sprint:** 30

---

## **Objective**

Replace shutdown deletion with state marking, verify online state, and complete fs→OOP migration for scenario housekeeping operations. This is the critical next step in File/Folder Architecture completion (72% → 85%).

---

## **Background**

From [2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md](../../components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md):

**Current State:**
- Scenario shutdown currently deletes files
- No proper state tracking for online/offline status
- Mixed fs.*Sync() and OOP method usage in housekeeping

**Target State:**
- Shutdown marks scenarios as "offline" instead of deleting
- Online state verification before operations
- 100% OOP File/Folder method usage (zero fs.*Sync() calls)

---

## **Requirements**

### **1. State Marking Instead of Deletion**
- [ ] Add `status` field to scenario models (online/offline/shutdown)
- [ ] Replace `deleteScenario()` with `markShutdown()` method
- [ ] Preserve scenario files on shutdown for debugging/recovery
- [ ] Implement cleanup policy (configurable retention)

### **2. Online State Verification**
- [ ] Add `verifyOnlineState()` method to scenario managers
- [ ] Check state before all operations (load, save, delete)
- [ ] Prevent operations on shutdown scenarios
- [ ] Proper error messages for offline scenario access

### **3. fs→OOP Migration**
- [ ] Identify all fs.*Sync() calls in scenario housekeeping code
- [ ] Replace with File/Folder OOP methods:
  - `existsSync()` → `folder.exists()` or `file.exists()`
  - `readdirSync()` → `folder.list()`
  - `unlinkSync()` → `file.delete()`
  - `rmdirSync()` → `folder.delete()`
- [ ] Use existing File/Folder patterns from FFM.0-FFM.3.6

---

## **Acceptance Criteria**

1. **State Management:**
   - All scenario shutdowns preserve files with "shutdown" status
   - Online state verification implemented and tested
   - No scenario operations possible on shutdown scenarios

2. **OOP Compliance:**
   - Zero fs.*Sync() calls remaining in scenario housekeeping code
   - All file operations use File/Folder classes
   - Consistent pattern with completed FFM work

3. **Testing:**
   - Unit tests for state marking logic
   - Integration tests for online state verification
   - Manual test: shutdown scenario, verify file preserved
   - Manual test: attempt operation on shutdown scenario, verify rejection

4. **Documentation:**
   - PDCA entry updated with implementation details
   - Code comments explain state transition logic
   - Migration pattern documented for FFM.4b reference

---

## **Technical Approach**

### **Files to Modify:**
Based on PDCA reference:
- `layer2/ServerHierarchyManager.ts` (scenario management)
- `layer2/ScenarioManager.ts` (lifecycle operations)
- `layer4/*Orchestrator.ts` (housekeeping coordination)

### **Pattern to Follow:**
```typescript
// OLD (fs-based deletion):
if (fs.existsSync(scenarioPath)) {
  fs.unlinkSync(scenarioPath);
}

// NEW (OOP state marking):
const scenarioFile = await File.init({ path: scenarioPath });
if (await scenarioFile.exists()) {
  scenario.model.status = 'shutdown';
  await scenario.save();  // Preserve with status
}
```

### **State Enum:**
```typescript
enum ScenarioStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SHUTDOWN = 'shutdown'
}
```

---

## **Dependencies**

### **Prerequisites:**
- ✅ FFM.0-FFM.3.6 complete (File/Folder OOP foundation exists)
- ✅ File/Folder classes ready in layer2

### **Blocks:**
- 🔵 Task 2 (FFM.4b ServerHierarchyManager fs cleanup)
- 🔵 Task 3 (FFM.5-FFM.7 final fs migration)

---

## **Definition of Done**

- [ ] All scenario shutdown operations mark state instead of deleting
- [ ] Online state verification implemented and tested
- [ ] Zero fs.*Sync() calls in scenario housekeeping code
- [ ] Unit tests passing (90%+ coverage)
- [ ] Integration tests passing
- [ ] Manual testing verified
- [ ] PDCA entry updated with results
- [ ] Code reviewed and merged to dev/claudeFlow.v1

---

## **Related Documents**

- [PDCA: Scenario Housekeeping Migration](../../components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md)
- [PDCA: File/Folder Architecture](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)

---

## **Notes**

- This is the critical blocker for completing File/Folder Architecture
- Pattern established here will be used in FFM.4b and FFM.5-FFM.7
- State marking approach aligns with CMM3 debugging requirements
- Cleanup policy should be configurable (default: 7 days retention)

---

**Created:** 2026-01-17
**Last Updated:** 2026-01-17
**Sprint:** [Sprint 30 Planning](./planning.md)
