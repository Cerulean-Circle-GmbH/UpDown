→[Back to Planning Sprint 30](./planning.md)

# Task 4: IOR Infrastructure R.2-R.6 Research Completion
[task:uuid:IOR-0004-2026-0118-RESEARCH-COMPLETION]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-4.1-researcher-browser-loading.md`)
- Subtasks must always indicate the affected role in the filename.
- Subtasks must be ordered to avoid blocking dependencies.

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] researching R.2
  - [ ] researching R.3
  - [ ] researching R.4
  - [ ] researching R.5
  - [ ] researching R.6
  - [ ] documenting findings
- [ ] QA Review
- [ ] Done

## Traceability
- Source: Web4 IOR Infrastructure Vision - Research Phase R.2-R.6
- **Up:**
  - [Web4 IOR Infrastructure Vision PDCA](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0100.web4-ior-infrastructure-vision.pdca.md)
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
- **Down:**
  - [ ] [Task 4.1: Researcher - Browser Loading Research](./task-4.1-researcher-browser-loading.md)
  - [ ] [Task 4.2: Researcher - Descriptor Chain Research](./task-4.2-researcher-descriptor-chain.md)
  - [ ] [Task 4.3: Researcher - CSS Loading Research](./task-4.3-researcher-css-loading.md)
  - [ ] [Task 4.4: Researcher - PWA Offline Strategy](./task-4.4-researcher-pwa-offline.md)
  - [ ] [Task 4.5: Researcher - WebSocket Sync Integration](./task-4.5-researcher-websocket-sync.md)

---

## **What** (WODA)
Complete remaining 5 research tasks (R.2-R.6) for Web4 IOR Infrastructure Vision, establishing the complete resource access chain from Node.js to PWA offline mode.

## **Overview** (WODA)
- **Priority:** 2 (High - Complete IOR Vision)
- **Estimated Time:** 6 hours
- **Current State:** R.1 complete (Node.js file loading mapped), R.2-R.6 pending
- **Target State:** Complete resource chain documented (Node.js → Browser → PWA → WebSocket sync)
- **Progress:** IOR Infrastructure Research 20% → 50%+ after completion
- **Can run parallel to:** Task 1 (FFM.4a), Task 2 (FFM.4b) - Independent research phase

## Context
Web4 IOR Infrastructure vision requires mapping the complete resource access chain. R.1 mapped Node.js file loading (15 files, 99 fs calls). R.2-R.6 extend this across browser resource loading, descriptor chains, CSS injection, PWA offline strategies, and WebSocket synchronization. This research establishes clear migration paths for all resource types.

## Intention
Create comprehensive technical foundation for IOR Infrastructure implementation. Document current resource access patterns across all layers (Node.js, Browser, PWA, offline). Identify integration points where IOR.load() replaces fetch()/fs functions. Enable teams to execute fs→IOR migration (Tasks 5-6) with clear, researched approaches.

---

## **Details** (WODA)

### Research Tasks Breakdown

| Task | Duration | Focus | Output |
|------|----------|-------|--------|
| R.2 | 1.5h | Browser resource loads (fetch, import, dynamic) | Loading pattern analysis + IOR migration points |
| R.3 | 1h | Descriptor chain (component.json → Unit → Artefact) | Descriptor dependency map + IOR integration |
| R.4 | 1h | CSS loading via IOR (injection patterns) | CSS access patterns + IOR approach |
| R.5 | 1.5h | PWA offline strategy (Service Worker + IOR) | Offline caching strategy + IOR sync |
| R.6 | 1h | WebSocket resource sync (peer-to-peer) | Sync patterns + conflict resolution |

### Deliverables per Research Task (R.2-R.6)

For each research task, produce in PDCA:

1. **Current State Analysis:**
   - How resource loading works today
   - Pain points and constraints
   - Files/code involved

2. **IOR Integration Approach:**
   - Proposed migration pattern
   - Technical changes required
   - Browser/PWA constraints addressed

3. **Code Examples:**
   - CURRENT: Existing pattern (fetch, fs, dynamic import)
   - PROPOSED: IOR-based pattern
   - Feasibility verification

4. **Migration Impact:**
   - Effort estimate (hours)
   - Prerequisites identified
   - Blockers/risks documented
   - Integration points with other R tasks

5. **Next Steps:**
   - Concrete action items for implementation
   - Testing approach
   - Rollback plan

---

## **Actions** (WODA)

### Phase 1: Research Planning
- [ ] Review R.1 findings (Node.js file loading baseline)
- [ ] Define research scope and constraints for each R task
- [ ] Identify integration dependencies between R.2-R.6
- [ ] Create findings template (PDCA structure)

### Phase 2: Execute Research Tasks
- [ ] **R.2: Browser Resource Loading**
  - Map all fetch() calls in codebase
  - Document dynamic import patterns
  - Identify CORS constraints
  - Propose IOR.load() replacement strategy
  - Effort estimate for migration

- [ ] **R.3: Descriptor Chain**
  - Trace component.json loading flow
  - Document Unit → Artefact resolution
  - Map nested dependency patterns
  - Identify circular dependency prevention
  - Propose IOR integration points

- [ ] **R.4: CSS Loading via IOR**
  - Analyze CSSLoader implementation
  - Document CSS injection patterns
  - Compare inline vs link tag approaches
  - Identify scoping/precedence issues
  - Propose IOR-based CSS access

- [ ] **R.5: PWA Offline Resource Strategy**
  - Research Service Worker caching patterns
  - Document offline-first requirements
  - Map IOR → SW cache integration
  - Identify cache invalidation strategy
  - Propose fallback patterns

- [ ] **R.6: WebSocket Resource Sync**
  - Research peer-to-peer sync patterns
  - Document IOR version tracking
  - Identify conflict resolution strategies
  - Analyze bandwidth optimization (delta sync)
  - Propose sync protocol for IOR resources

### Phase 3: Consolidation & Documentation
- [ ] Consolidate all 5 research findings in PDCA
- [ ] Create integration dependency diagram
- [ ] Verify code examples (compile check)
- [ ] Estimate total migration effort across all R tasks
- [ ] Document next steps for implementation
- [ ] QA review of findings

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_IOR_Research_R2R6.ts
const req = this.requirement('IOR Infrastructure R.2-R.6 Research', 'Complete resource chain mapping');
req.addCriterion('AC-01', 'R.2 Browser loading documented with IOR patterns');
req.addCriterion('AC-02', 'R.3 Descriptor chain mapped with dependency analysis');
req.addCriterion('AC-03', 'R.4 CSS loading approach documented');
req.addCriterion('AC-04', 'R.5 PWA offline strategy defined');
req.addCriterion('AC-05', 'R.6 WebSocket sync patterns identified');
req.addCriterion('AC-06', 'All code examples verified for feasibility');
req.addCriterion('AC-07', 'Migration effort estimated for each R task');
req.addCriterion('AC-08', 'Integration dependencies documented');
```

- [ ] **AC-01:** R.2 (Browser Loading) findings documented with fetch() → IOR.load() patterns
- [ ] **AC-02:** R.3 (Descriptor Chain) dependency map with nested resolution documented
- [ ] **AC-03:** R.4 (CSS Loading) approach with inline/link tag analysis documented
- [ ] **AC-04:** R.5 (PWA Offline) Service Worker strategy with cache invalidation documented
- [ ] **AC-05:** R.6 (WebSocket Sync) peer-to-peer sync with conflict resolution documented
- [ ] **AC-06:** Code examples compile and demonstrate feasibility
- [ ] **AC-07:** Migration effort estimated (hours) for each area
- [ ] **AC-08:** PDCA updated with all findings and integration points
- [ ] **AC-09:** Diagrams/flowcharts created for complex chains (R.3, R.5, R.6)
- [ ] **AC-10:** Team review completed
- [ ] **AC-11:** No gaps in resource access chain (Node.js → PWA offline)

---

## Dependencies

### Prerequisites:
- ✅ R.1 complete (Node.js file loading mapped)
- ✅ IOR Infrastructure I.1-I.6 (85% complete)
- ✅ Component architecture understanding

### Blocks:
- 🔵 Task 5 (DefaultUnit IOR Migration - requires R.2-R.6 guidance)
- 🔵 Task 6 (DefaultWeb4TSComponent IOR Migration - requires R.2-R.6 guidance)

### Can run parallel to:
- 🟢 Task 1 (FFM.4a Scenario Housekeeping - independent)
- 🟢 Task 2 (FFM.4b ServerHierarchyManager - independent)
- 🟢 Task 3 (FFM.5-7 fs migration - independent)

---

## Definition of Done

- [ ] All 5 research tasks (R.2-R.6) findings documented in PDCA
- [ ] Current state analysis for each resource type complete
- [ ] IOR integration approach defined for each resource type
- [ ] Code examples provided and verified (compile check)
- [ ] Migration effort estimated for each area
- [ ] Integration dependencies between R tasks documented
- [ ] No gaps in resource access chain (Node.js → PWA → offline → WebSocket)
- [ ] Diagrams/flowcharts created for complex chains
- [ ] PDCA entry updated with complete vision
- [ ] Team review completed and feedback incorporated
- [ ] Findings enable Task 5-6 implementation with confidence

---

## QA Audit & User Feedback

### TRON Requirements - IOR Infrastructure Research
```quote
Complete remaining research tasks (R.2-R.6) establishing the complete resource access chain from Node.js to PWA offline mode. All resource access via IOR — NO fetch(), NO fs functions.
```

- **Issue:** Incomplete understanding of resource access patterns across all layers
- **Resolution:** Systematic research of each layer with IOR integration approach identified
- **Pattern:** Research-driven implementation (findings guide Tasks 5-6)

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (resource access in scenario context)
- [ ] **P6:** Empty Constructor + init() (research findings shape patterns)
- [ ] **P34:** IOR as Unified Entry Point (replaces fetch(), fs, dynamic import)
- [ ] **P25:** Tootsie Tests Only (Web4Requirement-based verification)

---

## Related Documents

- [PDCA: Web4 IOR Infrastructure Vision](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0100.web4-ior-infrastructure-vision.pdca.md)
- [PDCA: IOR Infrastructure Implementation](../../components/ONCE/0.3.22.1/session/2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md)
- [PDCA: fs→IOR Migration](../../components/ONCE/0.3.22.1/session/2025-12-22-UTC-0200.fs-to-ior-migration.pdca.md)
- [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - IOR Infrastructure R.2-R.6 Research Completion*
*Priority: 2 (High) - Complete IOR Vision*
*Pattern: Systematic Research with IOR Integration Approach*
*Parallel Tasks: FFM.4a, FFM.4b, FFM.5-7*
