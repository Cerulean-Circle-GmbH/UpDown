[Back to Sprints](../)

# Sprint 30 Planning - ONCE 0.3.22.2 Fractal PDCA Completion

**📊 Sprint Status:** 0% Complete - Fresh Sprint
**🎯 Sprint Goal:** Complete Fractal PDCA methodology on ONCE 0.3.22.2 - File/Folder Architecture, IOR Infrastructure, and HTTPS.PWA
**⏱️ Estimated Work:** ~35-40 hours
**📍 Branch:** dev/claudeFlow.v1 (UpDown repository)

---

## **🔥 ACTIVE TASKS (High Priority)**

### **Priority 1: Critical - File/Folder Architecture Completion (72% → 100%)**

- [ ] [Task 1: FFM.4a Scenario Housekeeping Migration](./task-1-scenario-housekeeping-migration.md)
  **Priority:** 1 (Critical - Foundation for fs→IOR Migration) **Status:** 📋 PLANNED
  **Estimated Time:** 8h
  **Objective:** Replace shutdown deletion with state marking, verify online state, complete fs→OOP migration
  **Dependencies:** None (can start immediately)
  **PDCA Reference:** [2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md](../../components/ONCE/0.3.22.1/session/2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md)

- [ ] [Task 2: FFM.4b ServerHierarchyManager Remaining fs Calls](./task-2-serverhierarchymanager-fs-cleanup.md)
  **Priority:** 1 (Critical - Complete OOP Migration) **Status:** 📋 PLANNED
  **Estimated Time:** 4h
  **Objective:** Migrate remaining ServerHierarchyManager fs calls to File/Folder OOP methods
  **Dependencies:** Task 1 (FFM.4a completion)

- [ ] [Task 3: FFM.5-FFM.7 Final fs Sync Call Migration](./task-3-final-fs-sync-migration.md)
  **Priority:** 1 (Critical - 100% OOP Achievement) **Status:** 📋 PLANNED
  **Estimated Time:** 9h
  **Objective:** Eliminate all remaining ~80 sync fs calls across codebase
  **Dependencies:** Task 2 (FFM.4b completion)
  **Success Criteria:** Zero fs.*Sync() calls remaining, all replaced with OOP File/Folder methods

### **Priority 2: High - Web4 IOR Infrastructure (10% → 85%+)**

- [ ] [Task 4: IOR Infrastructure R.2-R.6 Research Completion](./task-4-ior-research-completion.md)
  **Priority:** 2 (High - Complete IOR Vision) **Status:** 📋 PLANNED
  **Estimated Time:** 6h
  **Objective:** Complete remaining 5 research tasks for Web4 IOR chain
  **Dependencies:** None (parallel to FFM work)
  **PDCA Reference:** [2025-12-22-UTC-0100.web4-ior-infrastructure-vision.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0100.web4-ior-infrastructure-vision.pdca.md)

- [ ] [Task 5: DefaultUnit IOR Migration](./task-5-defaultunit-ior-migration.md)
  **Priority:** 2 (High - IOR Pattern Adoption) **Status:** 📋 PLANNED
  **Estimated Time:** 1h
  **Objective:** Migrate 4 fs calls in DefaultUnit to IOR.load() / IOR.save()
  **Dependencies:** Task 4 completion recommended

- [ ] [Task 6: DefaultWeb4TSComponent IOR Migration](./task-6-defaultweb4tscomponent-ior-migration.md)
  **Priority:** 2 (High - Largest Migration) **Status:** 📋 PLANNED
  **Estimated Time:** 6h
  **Objective:** Migrate 32 fs calls to IOR pattern (largest single file migration)
  **Dependencies:** Task 5 (DefaultUnit pattern established)

### **Priority 3: Medium - HTTPS.PWA Completion (H.1-H.3 ✅ → H.4-H.5 ✅)**

- [ ] [Task 7: HTTPS.PWA H.4-H.5 LetsEncrypt Integration](./task-7-https-pwa-completion.md)
  **Priority:** 3 (Medium - User-Facing Feature) **Status:** 📋 PLANNED
  **Estimated Time:** 2.5h
  **Objective:** Complete LetsEncrypt UI action button and CertificateOrchestrator integration
  **Dependencies:** None (independent work)
  **PDCA Reference:** [2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md](../../components/ONCE/0.3.21.8/session/2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md)

---

## **📋 MEDIUM PRIORITY TASKS**

### **Component Descriptor & Web4TSComponent**

- [ ] [Task 8: Component Descriptor CD.5 Asset-Manifest Fallback Removal](./task-8-component-descriptor-cleanup.md)
  **Priority:** 4 (Medium - Cleanup) **Status:** 📋 PLANNED
  **Estimated Time:** 1.5h
  **Objective:** Remove deprecated asset-manifest fallback logic
  **Dependencies:** None
  **PDCA Reference:** [2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md)

- [ ] [Task 9: Web4TSComponent Inline Backlog Methods](./task-9-web4tscomponent-backlog.md)
  **Priority:** 4 (Medium - Technical Debt) **Status:** 📋 PLANNED
  **Estimated Time:** 8h
  **Objective:** Inline remaining 7 backlog methods (WM.B1-WM.B7)
  **Dependencies:** None
  **PDCA Reference:** [2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md)

---

## **🔵 FUTURE / DEFERRED TASKS**

### **Legacy Migration (Type Safety)**

- [ ] [Task 10: Legacy toScenario() Migration](./task-10-legacy-toscenario-migration.md)
  **Priority:** 5 (Low - Deferred) **Status:** 🟡 PLANNED
  **Estimated Time:** 8h
  **Objective:** Migrate 15+ classes using legacy toScenario() pattern
  **Dependencies:** FFM completion
  **PDCA Reference:** [2026-01-05-UTC-1000.legacy-toscenario-migration.pdca.md](../../components/ONCE/0.3.22.2/session/2026-01-05-UTC-1000.legacy-toscenario-migration.pdca.md)

### **Fetch Centralization**

- [ ] [Task 11: Fetch Centralization F.5 Test19 Verification](./task-11-fetch-centralization-final.md)
  **Priority:** 5 (Low - Deferred) **Status:** 🟡 PLANNED
  **Estimated Time:** 2h
  **Objective:** Verify Test19 shows 0 P7 violations (currently 8 remaining)
  **Dependencies:** None
  **PDCA Reference:** [2025-12-17-UTC-1740.fetch-centralization-dry.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-17-UTC-1740.fetch-centralization-dry.pdca.md)

---

## **✅ COMPLETED TASKS**

*No tasks completed yet - Sprint 30 just starting*

---

## **🎯 SPRINT ACHIEVEMENTS TARGET**

### **Primary Success Criteria:**
1. ✅ **File/Folder Architecture 100% Complete** (currently 72%)
   - All ~101 sync fs.*Sync() calls replaced with OOP methods
   - Scenario housekeeping properly implemented
   - ServerHierarchyManager fully migrated

2. ✅ **IOR Infrastructure 85%+ Complete** (currently 10%)
   - R.2-R.6 research tasks finished
   - DefaultUnit, DefaultWeb4TSComponent migrated to IOR pattern
   - Clear path to 100% IOR adoption

3. ✅ **HTTPS.PWA Complete** (currently H.1-H.3 ✅)
   - LetsEncrypt UI button functional
   - CertificateOrchestrator integrated
   - Full HTTPS/PWA capability demonstrated

### **Secondary Success Criteria:**
- Component Descriptor cleanup complete (CD.5)
- Web4TSComponent inline migration backlog reduced
- Fetch centralization violations down to 0

---

## **📊 CURRENT PDCA STATUS (from Tracking)**

### **File/Folder Architecture (FFM) - 72% Complete**
- ✅ **Completed:** FFM.0-FFM.3.6, KD, URP, ISR, FI, LR, FS (~18h/25h)
- 🔵 **Current:** FFM.4a Scenario Housekeeping (8h) ← **Sprint 30 Task 1**
- ⏳ **Pending:** FFM.4b-FFM.7 (~13h remaining)

### **Web4 IOR Infrastructure - 10% Complete**
- ✅ **Completed:** R.1 Node.js file loading mapped (15 files, 99 fs calls)
- ⏳ **Pending:** R.2-R.6 Research (5 tasks) ← **Sprint 30 Task 4**
- 🟡 **fs→IOR Migration:** In Progress (22.5h estimated)
  - ✅ 19 async content calls migrated (P2P pattern)
  - ⏳ ~80 sync fs calls remaining ← **Sprint 30 Tasks 1-3**

### **Component Descriptor - 95% Complete**
- ✅ **Completed:** CD.1-CD.4, CD.6 (540 units in ONCE.component.json)
- ⏳ **Pending:** CD.5 Asset-manifest fallback removal ← **Sprint 30 Task 8**

### **Web4TSComponent Inline - 64% Complete**
- ⏳ **Backlog:** 7 methods (WM.B1-WM.B7) ← **Sprint 30 Task 9**

### **HTTPS.PWA - H.1-H.3 ✅**
- ✅ **Completed:** H.1 Self-signed cert, H.2 HTTP→HTTPS redirect, H.3 All servers HTTPS
- ⏳ **Pending:** H.4 LetsEncrypt UI button, H.5 CertificateOrchestrator ← **Sprint 30 Task 7**

---

## **🔄 NEXT STEPS (Recommended Order)**

### **Phase 1: Foundation (Week 1)**
1. Start Task 1 (FFM.4a Scenario Housekeeping) - 8h
2. Parallel: Task 4 (IOR Research R.2-R.6) - 6h
3. Complete Task 2 (FFM.4b ServerHierarchyManager) - 4h

### **Phase 2: IOR Migration (Week 2)**
4. Task 5 (DefaultUnit IOR Migration) - 1h
5. Task 6 (DefaultWeb4TSComponent IOR Migration) - 6h
6. Task 3 (FFM.5-FFM.7 Final fs Migration) - 9h

### **Phase 3: Polish & Delivery (Week 3)**
7. Task 7 (HTTPS.PWA H.4-H.5) - 2.5h
8. Task 8 (Component Descriptor CD.5) - 1.5h
9. Optional: Task 9 (Web4TSComponent Backlog) if time permits

---

## **⚠️ RISK FACTORS**

### **Technical Risks:**
- **Complexity Risk:** fs→IOR migration touches 15+ files with 80+ calls
- **Integration Risk:** IOR pattern must work across Node.js and browser contexts
- **Testing Risk:** Changes affect core file operations - comprehensive testing required

### **Mitigation Strategies:**
- Follow fractal PDCA methodology strictly - one file at a time
- Use existing File/Folder OOP patterns from completed FFM work
- Test each migration phase before proceeding
- Leverage completed IOR infrastructure (I.1-I.6 already 85% done)

---

## **📚 KEY REFERENCE DOCUMENTS**

| Document | Purpose | Location |
|----------|---------|----------|
| Iteration Tracking PDCA | Sprint source document | [§/.../2025-12-12-UTC-2100.iteration-tracking.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md) |
| File/Folder Architecture | FFM.4a-FFM.7 details | [§/.../2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md) |
| Web4 IOR Infrastructure | R.2-R.6 research tasks | [§/.../2025-12-22-UTC-0100.web4-ior-infrastructure-vision.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0100.web4-ior-infrastructure-vision.pdca.md) |
| fs→IOR Migration | Migration patterns | [§/.../2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md) |
| HTTPS.PWA Integration | H.4-H.5 details | [§/.../2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md](../../components/ONCE/0.3.21.8/session/2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md) |
| Web4 Principles | 35 principles checklist | [§/.../web4-principles-checklist.md](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md) |
| Fractal PDCA Howto | Methodology guide | [§/../../../../Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md](../../../../Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md) |

---

## **🎯 DEFINITION OF DONE**

### **Sprint 30 Complete When:**
- [ ] File/Folder Architecture reaches 100% (all fs.*Sync() eliminated)
- [ ] IOR Infrastructure reaches 85%+ (R.2-R.6 complete, major migrations done)
- [ ] HTTPS.PWA fully functional (H.4-H.5 complete)
- [ ] All critical path tasks (1-7) completed
- [ ] Tests passing for all migrated code
- [ ] PDCA documentation updated for all completed work

### **Quality Gates:**
- All code follows Web4 Principles (35 principles)
- CMM3 compliance maintained throughout
- Fractal PDCA methodology followed for each task
- No regressions in existing functionality

---

**Last Updated:** 2026-01-17
**Next Review:** Sprint 30 Daily Standups
**Related Sprint:** [Sprint 20](../sprint-20/planning.md) (methodology reference)
