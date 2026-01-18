[Back to Planning Sprint 30](./planning.md)

# Task 8: Web4TSComponent 0.3.22.4 Standalone ONCE Wrapper
[task:uuid:W4TSC-0008-2026-0118-STANDALONE-WRAPPER]

## Naming Conventions
- Tasks: `task-<number>-<short-description>.md`
- Subtasks: `task-<number>.<subnumber>-<role>-<short-description>.md` (e.g., `task-8.1-developer-version-detection.md`)
- Subtasks must always indicate the affected role in the filename.
- Subtasks must be ordered to avoid blocking dependencies.

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement
  - [x] architecture decision (D2 - thin wrapper)
  - [x] implementing phases 1-7
  - [x] testing version detection ✅
  - [ ] considering ONCE DefaultCLI fix (optional - already fixed locally)
- [ ] QA Review
- [ ] Done

## Traceability
- Source: Web4TSComponent Standalone Architecture - @web4x/once NPM Dependency Pattern
- **Up:**
  - [Iteration Tracking PDCA](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
  - [Standalone ONCE Wrapper Architecture PDCA](../../components/Web4TSComponent/0.3.22.4/session/2026-01-16-UTC-1202.standalone-once-wrapper-architecture.pdca.md)
- **Down:**
  - [x] Phase 1: src/ts cleanup (files removed, folders kept)
  - [x] Phase 2: package.json with @web4x/once dependency
  - [x] Phase 3: Web4TSComponentCLI.ts imports update
  - [x] Phase 4: tsconfig.json simplification
  - [x] Phase 5: build.sh single-stage
  - [x] Phase 6: Shell wrapper verification
  - [x] Phase 7: npm install + verification
  - [x] Phase 8: Version detection implementation (discoverComponentRootAndVersion)
  - [ ] [Task 8.2: Developer - ONCE DefaultCLI Getter Fix](./task-8.2-developer-defaultcli-getter-fix.md) (optional)

---

## **What** (WODA)
Complete Web4TSComponent 0.3.22.4 standalone wrapper that uses @web4x/once as npm dependency, establishing thin wrapper pattern for component reuse.

## **Overview** (WODA)
- **Priority:** 2 (High - Architecture Pattern)
- **Estimated Time:** 0.5 hours remaining (95% complete)
- **Current State:** Phases 1-8 complete, version detection working
- **Target State:** Commit, push, update PDCA
- **Progress:** Web4TSComponent 0.3.22.4 95% → 100% after commit/push

## Context
Web4TSComponent 0.3.22.4 was created to unify standalone and embedded architectures. The TRON decision (D2) selected thin wrapper approach where Web4TSComponent uses @web4x/once as npm dependency rather than duplicating code. ONCE already has proper package.json definition (`@web4x/once` version 0.3.22.2). During implementation, a getter access bug was discovered in DefaultCLI's `analyzeComponentMethods()` when iterating prototype properties.

## Intention
Create clean npm-based dependency pattern for Web4TSComponent. Enable component reuse without code duplication. Fix discovered getter access bug to prevent similar issues in other CLI-based components. Establish thin wrapper pattern for future Web4TSComponent versions.

---

## **Details** (WODA)

### Files Modified:
| File | Purpose | Status |
|------|---------|--------|
| `Web4TSComponent/0.3.22.4/package.json` | @web4x/once dependency | ✅ Complete |
| `Web4TSComponent/0.3.22.4/src/ts/layer5/Web4TSComponentCLI.ts` | Import from @web4x/once, getter fix | ✅ Complete |
| `Web4TSComponent/0.3.22.4/tsconfig.json` | Single-stage local build | ✅ Complete |
| `Web4TSComponent/0.3.22.4/src/sh/build.sh` | Smart build with ONCE check | ✅ Complete |
| `Web4TSComponent/0.3.22.4/src/ts/layer2-4/*.ts` | Removed (empty folders kept) | ✅ Complete |

### Technical Specifications (Complete Code)

**Package.json Dependency:**
```json
{
  "name": "@web4x/web4tscomponent",
  "version": "0.3.22.4",
  "type": "module",
  "main": "dist/ts/layer5/Web4TSComponentCLI.js",
  "dependencies": {
    "@web4x/once": "file:../../ONCE/0.3.22.2"
  }
}
```

**Import Pattern (NEW):**
```typescript
// Imports from npm package instead of relative paths
import { DefaultCLI } from '@web4x/once/dist/ts/layer2/DefaultCLI.js';
import { DefaultWeb4TSComponent } from '@web4x/once/dist/ts/layer2/DefaultWeb4TSComponent.js';
import { TSCompletion } from '@web4x/once/dist/ts/layer4/TSCompletion.js';
```

**Getter Access Bug Fix:**
```typescript
// Problem: prototype[name] triggers getters where ucpModel is undefined
// Fix: Use getOwnPropertyDescriptor to check without triggering
analyzeComponentMethods(): this {
  const prototype = Object.getPrototypeOf(this.delegateInstance);
  for (const name of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
    if (descriptor?.get || descriptor?.set) continue; // Skip getters
    if (typeof descriptor?.value !== 'function') continue;
    // ... process method
  }
  return this;
}
```

**Architecture:**
```
Web4TSComponent/0.3.22.4/
├── package.json           # @web4x/once as dependency
├── src/ts/
│   ├── layer2/            # EMPTY (folders kept)
│   ├── layer3/            # EMPTY
│   ├── layer4/            # EMPTY
│   └── layer5/
│       └── Web4TSComponentCLI.ts   # Imports from @web4x/once
├── dist/ts/layer5/
│   └── Web4TSComponentCLI.js       # Only local file compiled
├── node_modules/
│   └── @web4x/once -> ../../../ONCE/0.3.22.2  # Local file dependency
└── src/sh/build.sh        # Single-stage build
```

---

## **Actions** (WODA)

### Completed Phases ✅
- [x] **Phase 1:** Remove unused .ts files from src/ts/layer2-4, keep folders
- [x] **Phase 2:** Update package.json with @web4x/once file dependency
- [x] **Phase 3:** Modify Web4TSComponentCLI.ts imports to use npm package
- [x] **Phase 4:** Simplify tsconfig.json for local-only build
- [x] **Phase 5:** Update build.sh to single-stage (check ONCE first)
- [x] **Phase 6:** Verify shell wrapper (web4tscomponent) works
- [x] **Phase 7:** npm install creates symlink, verification tests pass

### Remaining Actions
- [x] **Version Detection:** Implemented `discoverComponentRootAndVersion()` using `import.meta.url`
- [ ] **Consider ONCE Fix:** Fix getter access in ONCE DefaultCLI for all consumers (optional - already fixed locally)

---

## Acceptance Criteria

**Web4Requirement Integration:**
```typescript
// In test/tootsie/Test_W4TSC0322_StandaloneWrapper.ts
const req = this.requirement('Web4TSComponent 0.3.22.4 Standalone', 'Thin wrapper using @web4x/once');
req.addCriterion('AC-01', 'package.json has @web4x/once as dependency');
req.addCriterion('AC-02', 'npm install creates node_modules/@web4x/once symlink');
req.addCriterion('AC-03', './web4tscomponent shows usage with all methods');
req.addCriterion('AC-04', 'All delegated methods work (links, tree, etc.)');
req.addCriterion('AC-05', 'Build is single-stage (only local CLI compiled)');
req.addCriterion('AC-06', 'ONCE unchanged (uses existing package definition)');
```

- [x] **AC-01:** package.json has @web4x/once as file dependency
- [x] **AC-02:** npm install creates proper symlink in node_modules
- [x] **AC-03:** ./web4tscomponent shows usage with all discovered methods
- [x] **AC-04:** Delegated methods work (links show, etc.)
- [x] **AC-05:** Build is single-stage (only Web4TSComponentCLI.ts compiled)
- [x] **AC-06:** ONCE unchanged (already had package definition)
- [x] **AC-07:** Version detection works in project context ✅ (shows v0.3.22.4)
- [x] **AC-08:** Getter access fix implemented locally in Web4TSComponentCLI

---

## Dependencies

### Prerequisites:
- ✅ ONCE 0.3.22.2 has @web4x/once package definition
- ✅ ONCE built (dist/ts/ exists)
- ✅ Web4TSComponent 0.3.22.4 created from 0.3.20.6

### Blocks:
- 🔵 Future Web4TSComponent versions can follow this pattern

### Related:
- Web4TSComponent Inline Migration (Task 9) - may benefit from shared patterns

---

## Definition of Done

- [x] src/ts/layer2-4 emptied (folders kept per TRON requirement)
- [x] package.json has @web4x/once as dependency
- [x] Web4TSComponentCLI.ts imports from @web4x/once
- [x] tsconfig.json simplified for local build only
- [x] build.sh is single-stage with ONCE prerequisite check
- [x] npm install creates proper symlink
- [x] ./web4tscomponent works with all commands
- [x] ONCE unchanged (uses existing package definition)
- [x] Getter access bug fixed in local Web4TSComponentCLI
- [x] Version detection tested with project context ✅ (shows v0.3.22.4)
- [x] ONCE DefaultCLI getter fix: implemented locally, optional for ONCE
- [ ] PDCA updated with completion results
- [ ] Code committed and pushed

---

## QA Audit & User Feedback

### TRON Requirements - Web4TSComponent 0.3.22.4
```quote
D2 but ONCE shall not be changed. all changes must be contained to be only in Web4TSComponent/0.3.22.4.
the build shall use the ONCE sources, but build the dist in Web4TSComponent/0.3.22.4/dist
```

```quote
ok there is one single change that can be done to ONCE. once should be defined as a npm package with its version and be used as a build dependency.
```

- **Issue:** Code duplication between standalone and ONCE embedded versions
- **Resolution:** Thin wrapper using @web4x/once as npm dependency
- **Pattern:** NPM file: protocol for local development dependency
- **Discovery:** ONCE already has @web4x/once package definition (no change needed)

### Web4 Principles Verified
- [ ] **P1:** Everything is a Scenario (CLI scenario context)
- [ ] **P6:** Empty Constructor + init(scenario) - static async start() pattern
- [ ] **P14:** Async operations (smart build, npm resolution)
- [ ] **P34:** IOR as Unified Entry Point (npm package resolution)

---

## Key Learnings

1. **UcpComponent Initialization:** The new ONCE architecture uses UcpModel for reactive state. `ucpModel` is `null` on instances but `undefined` on prototypes.

2. **ONCECLI Pattern:** Empty constructor + static async `start()` with chained `.init()` is proper way to initialize UcpComponent-based CLIs.

3. **Getter Safety:** When iterating prototype properties, use `getOwnPropertyDescriptor` to check if something is a function without triggering getters.

4. **NPM file: protocol:** Using `"file:../../ONCE/0.3.22.2"` enables local development with proper npm dependency semantics.

---

## Related Documents

- [PDCA: Standalone ONCE Wrapper Architecture](../../components/Web4TSComponent/0.3.22.4/session/2026-01-16-UTC-1202.standalone-once-wrapper-architecture.pdca.md)
- [PDCA: Iteration Tracking](../../components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md)
- [Web4 Principles Checklist](../../components/ONCE/0.3.22.1/session/web4-principles-checklist.md)
- [CMM3 Compliance Checklist](../../../Web4Articles/scrum.pmo/roles/_shared/cmm3.compliance.checklist.md)

---

*Sprint 30 - Web4TSComponent 0.3.22.4 Standalone ONCE Wrapper*
*Priority: High - Architecture Pattern (95% Complete)*
*Pattern: NPM file: Dependency with Thin Wrapper*
*Version Detection: discoverComponentRootAndVersion() using import.meta.url*
