# Agent Learning Log - ONCE v0.3.22.1

**Purpose:** Accumulated learnings to avoid repeating mistakes. DRY - one entry per lesson.

---

## **🎯 Session Learnings**

### **L1: Cursor Crashes with Playwright Browser**
**Date:** 2025-12-17  
**Source:** Previous agent session  
**Lesson:** Cursor IDE crashes when Playwright opens internal browser repeatedly. The agent got confused after multiple crashes.  
**Action:** When testing, prefer console output verification over visual browser inspection. Use `page.on('request')` / console capture instead of screenshots when possible.

### **L2: Dual Links in Chat Must Use Absolute Paths**
**Date:** 2025-12-17  
**Source:** User feedback  
**Lesson:** In chat responses, the local link in dual links MUST use absolute filesystem paths, not relative.  
**Format:**
```markdown
[GitHub](https://...) | [§/project/path](/absolute/filesystem/path)
```

### **L3: DRY for Agent Context**
**Date:** 2025-12-17  
**Source:** Context creation  
**Lesson:** Keep agent context minimal by linking to authoritative sources instead of duplicating content. 726 lines → 190 lines by linking.

### **L4: Vitest ≠ Violation — It's Infrastructure for Tootsie**
**Date:** 2025-12-17  
**Source:** User correction on TM.4  
**Lesson:** Vitest is **NOT** a violation of P25 (Tootsie Tests Only). The relationship is:

```
┌─────────────────────────────────────────────────────────────┐
│  VITEST = Infrastructure Layer                              │
│  ├── Test runner (beforeAll, afterAll, describe, it)       │
│  ├── Test isolation setup (once-test-isolation-setup.test) │
│  ├── Creates test/data/ with components & symlinks         │
│  └── Timeouts, parallelism control, reporters               │
├─────────────────────────────────────────────────────────────┤
│  TOOTSIE = Functional Test Layer                            │
│  ├── ONCETestCase extends DefaultWeb4TestCase              │
│  ├── Web4Requirement for acceptance criteria                │
│  ├── Black-box testing (IOR calls, CLI commands)           │
│  └── Uses test/data/ SET UP by Vitest                      │
└─────────────────────────────────────────────────────────────┘
```

**Key Files:**
- `test/vitest/once-test-isolation-setup.test.ts` - Sets up `test/data/`
- `vitest.config.ts` - Configures test runner
- `test/tootsie/ONCETestCase.ts` - Tootsie base class using `this.testDataDir`

**Critical Insight:** "Getting it right first is 100x better than fixing it later. Keep self-informing."

### **L5: Git Commit Message = PDCA Filename Only**
**Date:** 2025-12-17  
**Source:** User correction  
**Lesson:** Git commit messages should be JUST the PDCA filename, nothing more.

**Correct:**
```bash
git commit -m "2025-12-17-UTC-1613.web4-principles-review.pdca.md"
```

**Wrong:**
```bash
git commit -m "2025-12-17-UTC-1613.web4-principles-review.pdca.md Phase A: Critical Fixes..."
```

### **L7: Test Migration ≠ Just Moving Files**
**Date:** 2025-12-17  
**Source:** User correction on TM.1  
**Lesson:** Tests in `/src/ts/tests/` are NOT Tootsie tests - they use a custom framework. Migration requires:
1. Add `extends ONCETestCase`
2. Rename `run()` → `executeTestLogic()`
3. Replace `console.log()` → `this.logEvidence()`
4. Replace `throw new Error()` → `this.requirement()` + `validateCriterion()`
5. Move to `/test/tootsie/`

**Effort difference:** "Move" = 30 min vs "Migrate" = 4-6 hours. Always verify actual code structure first!

### **L8: Route Shadowing - StaticFileRoute vs IORRoute**
**Date:** 2025-12-17  
**Source:** Test02 DEMO-10 failure  
**Lesson:** `StaticFileRoute.matches()` incorrectly matches IOR URLs because it classifies paths without extensions as "directories".

**The Bug:**
```
URL: /ONCE/0.3.22.1/633db3c2-.../peerStopAll
lastSegment = 'peerStopAll'
lastSegment.includes('.') === false  // No dot
isDirectory = true  // WRONG!
StaticFileRoute matches → Shadows IORRoute → NOT FOUND
```

**Fix Required:** `StaticFileRoute.matches()` should check for IOR pattern (4 segments, UUID format) and reject.

### **L10: TRON Decides Backlog - Not Agent**
**Date:** 2025-12-17  
**Source:** User correction  
**Lesson:** The agent does NOT decide what goes to backlog. TRON (user) makes all prioritization decisions.

**Wrong behavior:**
- Agent decides "this is low priority, moving to backlog"
- Agent applies "duct tape" fixes without asking
- Agent defers decisions unilaterally

**Correct behavior:**
- Agent presents options with tradeoffs
- Agent asks: "Do you want to (a) fix now, (b) backlog, or (c) other?"
- Agent waits for TRON decision before proceeding

### **L11: No Duct Tape Without Permission**
**Date:** 2025-12-17  
**Source:** User correction (ONCE.ts type assertion)  
**Lesson:** Never apply workarounds (like `as unknown as Type`) without asking first.

**Example of violation:**
```typescript
// I added this without asking:
return new BrowserOnce() as unknown as ONCEKernel;
// Comment: "⚠️ TECHNICAL DEBT"
```

**Correct approach:**
1. Identify the problem (BrowserOnce doesn't implement ONCEKernel)
2. Create PDCA with options
3. ASK user which option to pursue
4. Only then implement

---

### **L9: DRY Violation - Duplicate Route Registrations**
**Date:** 2025-12-17  
**Source:** ServerHierarchyManager.registerRoutes()  
**Lesson:** Massive DRY violations in route registration:

1. **Trailing slash duplication** (8 duplicate routes):
   - `/demo` AND `/demo/` (identical)
   - `/once` AND `/once/` (identical)
   - `/onceCommunicationLog` AND `/onceCommunicationLog/` (identical)
   - `/EAMD.ucp` AND `/EAMD.ucp/` (identical)

2. **Identical boilerplate** (12+ routes):
   ```typescript
   const route = new HTMLRoute();
   route.model.uuid = this.idProvider.create();
   route.setPattern('/path', HttpMethod.GET);
   route.setProvider(() => this.component!.someMethod());
   route.model.priority = 50;
   this.httpRouter.registerRoute(route);
   ```

**Fix:** Create `this.registerHTMLRoute(pattern, provider, priority?)` helper.

### **L12: PDCA Hygiene is NOT Optional — Post-Prompt Protocol**
**Date:** 2025-12-19  
**Source:** User frustration after 5 consecutive prompts requiring manual reminders  
**Lesson:** The agent kept forgetting to perform automatic PDCA hygiene tasks that should happen after EVERY prompt.

**The 6-Step Post-Prompt Protocol (MANDATORY):**
1. **UPDATE** all checkboxes in affected PDCAs (`[ ]` → `[x]`)
2. **UPDATE** fractal stack in tracking PDCA
3. **EXTRACT** deferred items → add to **FRACTAL STACK as 🔶 QUEUED (HIGH PRIORITY)**, NOT buried in someday backlog
4. **COMMIT** with `git add . && git commit -m "PDCAfilename.pdca.md" && git push`
5. **VERIFY** git status shows clean state
6. **PROVIDE** dual links for all PDCAs touched

**Deferred Items Priority Rule:**
> Extracted/deferred tasks are **NEXT HIGHEST PRIORITY** unless user explicitly says otherwise.

**Critical Rule:**
> DO NOT ask "Ready for next?" until ALL 6 steps are complete.

**If TRON says "Checklist":** Agent must immediately perform all 6 steps.

**Reference:** [§/session/2025-12-19-UTC-improvement-pdca-automation.md](./2025-12-19-UTC-improvement-pdca-automation.md)

### **L13: DRY Applies to PDCAs, Stacks, and Plans — No Duplicates**
**Date:** 2025-12-19  
**Source:** User correction after agent created duplicate entries  
**Lesson:** When reorganizing information, **MOVE** don't **DUPLICATE**.

**Wrong (creates inconsistencies):**
```markdown
- 🔵 QUEUED → I.1 ActionBar — [→ Section]        ← DUPLICATE #1
...many lines later...
- 🔵 I.1 ActionBar — PENDING — [→ Section]       ← DUPLICATE #2
```

**Correct (single source of truth):**
```markdown
- 🔵 **I.1 ActionBar**: Dynamic Actions — **QUEUED** — [→ Section]
```

**Consistent Format Pattern:**
```
[icon] **[ID] [Name]**: [Description] — **[STATUS]** — [→ Link]
```

**Status values:** NEXT, QUEUED, PENDING, IN PROGRESS, COMPLETE, DEFERRED, PLANNED

**Key Rule:** QUEUED is a STATUS like COMPLETE — not a prefix before `→`.

**Applies to:** Code, PDCAs, plans, stacks — ALL information. CMM3 = consistent templates, not floating CMM2 variations.

### **L14: Lazy Web4 Migration — Fix Violations Incrementally**
**Date:** 2025-12-19  
**Source:** User request to add Test19 to per-prompt checklist  
**Lesson:** Run `./once tootsie file 19` if token budget allows. Fix 1-2 violations BEFORE each commit.

**Per-Prompt Step (Phase 3.5):**
```bash
./once tootsie file 19   # Run Web4 lazy migration scan
# Review violations, pick 1-2 quick wins, fix them, THEN commit
```

**Benefit:** Gradual codebase cleanup without dedicated refactoring time. 1000+ violations → 0 through incremental fixes.

### **L15: Verify Before Marking Complete — grep > checkbox**
**Date:** 2025-12-19  
**Source:** User caught discrepancy between PDCA claims and actual code state  
**Lesson:** Before marking a task complete, **verify with grep** that the work is actually done.

### **L16: Self-Re-Inform When Context Summarized**
**Date:** 2025-12-19  
**Source:** User guidance after context summary  
**Lesson:** When context was summarized (losing details), immediately re-read key files:

1. **Tracking PDCA** → fractal stack, what's next
   - [§/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md](./2025-12-12-UTC-2100.iteration-tracking.pdca.md)
2. **Agent context** → per-prompt checklist
   - [§/session/2025-12-17-UTC-1200.agent-context.md](./2025-12-17-UTC-1200.agent-context.md)
3. **Methodology** → howto.fractal.pdca.md
   - [§/scrum.pmo/.../howto.fractal.pdca.md](../../../../../Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md)

**Pattern:** `read_file` costs tokens but prevents mistakes that cost MORE tokens to fix.

### **L17: Component Anatomy — Fetch is NEVER in Views**
**Date:** 2025-12-19  
**Source:** TRON clarification on F.1 PDCA  
**Lesson:** Correct component architecture for fetch:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 2 = Component (main implementation)                  │
│  ├── Manages views                                          │
│  ├── Owns the model                                         │
│  └── Has methods that TRIGGER layer4 async                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 5 = Views                                            │
│  ├── Model → View rendering ONLY                            │
│  ├── Event handling (onClick, etc.) ONLY                    │
│  └── If needs data → ASK component, NEVER fetch directly    │
├─────────────────────────────────────────────────────────────┤
│  Layer 4 = Orchestrators (ONLY async layer)                 │
│  ├── fetch() lives HERE                                     │
│  ├── Triggered BY component methods                         │
│  └── Calls component SYNC callback when resolved            │
└─────────────────────────────────────────────────────────────┘
```

**Flow:**
1. View needs data → calls `component.methodName()`
2. Component triggers `layer4Orchestrator.asyncMethod()`
3. Layer4 does `fetch()` → resolves promise
4. Layer4 calls `component.syncCallback(data)`
5. Component updates model
6. Controller triggers view re-render

**Wrong:** View has `await fetch('/api/...')` ❌
**Right:** View calls `this.component.loadData()` → component triggers layer4 ✅

**Reactive Re-render:**
```typescript
// Component sets model → UcpModel proxy detects → Controller triggers View.render()
this.model.data = data;  // ← This ALONE triggers re-render. No callback needed.
```
`onDataLoaded()` is optional interceptor for logging/transformation, NOT for triggering render.

**Wrong (premature checkbox):**
```markdown
- [x] MC.1.2: Update ServerHierarchyManager to use ONCEPeerModel ✅
```
Meanwhile: `grep ONCEServerModel | wc -l` → 38 usages remain

**Correct (verify first):**
```bash
# Before checking a box:
grep -r "ONCEServerModel" src/ | wc -l  # Should be 0 or only deprecated uses
```

**Rule:** `grep` output is truth. Checkboxes are claims. Verify claims before committing.

### **L18: Run Test19 BEFORE Commit — Not After**
**Date:** 2025-12-20  
**Source:** User correction  
**Lesson:** Before committing, run `./once tootsie file 19` to check for Web4 violations. Fix 1-2 violations BEFORE commit, not as a separate task.

**Correct Order:**
```
1. Code changes
2. tsc --noEmit
3. Run Test02 (or relevant test)
4. Run Test19 → fix 1-2 violations  ← BEFORE COMMIT!
5. git add && git commit -m "PDCAfilename.pdca.md"
6. git push && git status
```

### **L19: Follow L5 — Commit Message = PDCA Filename**
**Date:** 2025-12-20  
**Source:** User correction  
**Lesson:** L5 exists but I didn't follow it! Descriptive commit messages are WRONG. Always use:

```bash
git commit -m "2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md"
```

NOT:
```bash
git commit -m "I.4 COMPLETE: Router DRY + P4/P6 compliance"  # ❌ WRONG
```

**Action:** Re-read learnings before each commit. Document and follow, don't just document.

### **L20: Information Hierarchy — Checklist → Details → PDCAs**
**Date:** 2025-12-21  
**Source:** User guidance on component anatomy documentation  
**Lesson:** Web4 has a consistent pattern for managing large amounts of information:

```
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 1: CHECKLIST (token-optimized, < 100 lines)          │
│  ├── Quick verification before commit/release               │
│  ├── Checkbox format: - [ ] Brief description               │
│  └── Links to details: [§/session/xyz-details.md]           │
├─────────────────────────────────────────────────────────────┤
│  LEVEL 2: DETAILS (comprehensive, 200-500 lines)            │
│  ├── Full explanations with code examples                   │
│  ├── Anti-patterns and correct patterns                     │
│  └── Links to PDCAs for specific implementations            │
├─────────────────────────────────────────────────────────────┤
│  LEVEL 3: FRACTAL PDCAs (action-oriented)                   │
│  ├── Specific tasks with checkboxes                         │
│  ├── P-D-C-A structure (Plan-Do-Check-Act)                  │
│  └── Tracked in iteration-tracking PDCA stack               │
└─────────────────────────────────────────────────────────────┘
```

**Files in ONCE/0.3.22.1/session/:**
- `web4-principles-checklist.md` → `web4-principles-details.md`
- `web4-component-anatomy-checklist.md` → `web4-component-anatomy-details.md`
- `2025-12-12-UTC-2100.iteration-tracking.pdca.md` (stack of all PDCAs)

**When to read which:**
| Situation | Read |
|-----------|------|
| Before commit | Checklist |
| Need to understand why | Details |
| Need to implement | Specific PDCA |
| Context recovery | Tracking PDCA → Checklists → Current PDCA |

### **L21: UCP = Unit - Component - Package**
**Date:** 2025-12-21  
**Source:** User correction on component.json understanding  
**Lesson:** The UCP hierarchy is fundamental to Web4:

- **Unit**: Atomic terminal file (CSS, TS, JSON, SH) with `.unit` symlink to scenario
- **Component**: Versioned folder with 4 criteria (black box, interfaces, self-contained, descriptor)
- **Package**: Group of components

**Component Descriptor (`xyz.component.json`):**
- IS a `Scenario<Web4TSComponentModel>` — NOT just config
- HAS its own `unit: Scenario<UnitModel>` — the descriptor is itself a unit!
- LISTS all units (CSS, TS, JSON, SH scripts, etc.) — for self-management

**Wrong understanding:**
```
component.json is just metadata listing files
```

**Correct understanding:**
```
component.json IS a scenario with:
- ior: identifies the component
- owner: who created it
- model: Web4TSComponentModel with all unit references
- unit: the descriptor's own unit metadata
```

**Reference:** [§/session/web4-component-anatomy-details.md](./web4-component-anatomy-details.md)

### **L22: Generated Files Are Sacred — Never Edit Manually**
**Date:** 2025-12-21  
**Source:** User correction after I manually edited ONCE.component.json  
**Lesson:** Files generated by tooling (like `UnitDiscoveryService`) must NEVER be manually edited.

**Generator Code:** `src/ts/layer2/UnitDiscoveryService.ts`
- Lines 390-424: `manifestUpdate()` — reads/creates manifest, writes back
- Lines 294-305: `manifestUnitsGenerate()` — creates unit arrays
- Lines 346-373: `parseUnitSymlink()` — extracts UUID, name, path, mimetype

**Wrong:**
```bash
vim ONCE.component.json  # ❌ FORBIDDEN
```

**Correct:**
```bash
# Fix the generator code, then regenerate
./once tootsie file 14
```

### **L23: Never Hallucinate File Contents**
**Date:** 2025-12-21  
**Source:** User correction after I invented file formats  
**Lesson:** Always READ ACTUAL CODE to understand what is generated.

**Wrong (hallucinated):**
```json
"uuid": "once-0.3.22.1-component"  // ❌ Invented string
```

**Correct (from actual code line 401):**
```typescript
uuid: crypto.randomUUID()  // ✅ Always UUIDv4
```

**Rule:** Reference actual line numbers. Don't invent JSON structures.

### **L24: Checklist Structure — Single Lines, Not Sections**
**Date:** 2025-12-21  
**Source:** User correction on checklist format  
**Lesson:** Checklists use single-line items, NOT tables or sections.

**Wrong:**
```markdown
## Component Criteria
- [ ] **C1: Black Box** — description

## Unit Structure
| Category | Examples |
```

**Correct:**
```markdown
- [ ] Component C1: Black Box - description - [Details](link) | [Example](code)
- [ ] Unit U1: Symlink Exists - description - [Details](link) | [Generator](code)
```

**Reference:** Compare `web4-principles-checklist.md` (correct) vs my first attempt (wrong).

### **L26: MOVE Don't Restructure — Format Changes Require Permission**
**Date:** 2025-12-21  
**Source:** User correction after I reorganized PDCA stack  
**Lesson:** When asked to "move" items in a document, ONLY MOVE them. Do NOT:
- Change the structure or format
- Split into sections (MAIN/QUEUED/PENDING when there was one stack)
- Copy information (creates duplicates)
- Delete information

**Wrong (I did this):**
```markdown
### 🔴 CURRENT + NEXT
- 📁 Main PDCA...
### 🔵 QUEUED (Next Priority)  ← Created new section!
- ...
### 🔵 PENDING (Future)  ← Created new section!
```

**Correct (what was asked):**
```markdown
## FRACTAL PDCA STACK
- 📁 Main PDCA...
  - 🟡 IN PROGRESS — CD...
  - 🔵 QUEUED — I.1...      ← Just moved, same format
  - 🔵 PENDING — I.11...    ← Just moved, same format
```

**Rule:** If user says "move X to bottom" → cut+paste X to bottom. Nothing else.

**Key Principle:** DRY + consistency. Moving = same format. Never copy. If format change is needed → ASK FIRST.

---

### **L25: Tests Import REAL Code — No Fake Duplicates**
**Date:** 2025-12-21  
**Source:** User correction on Test14  
**Lesson:** Tests should NOT define arbitrary stable test types. Tests MUST import REAL src files to test REAL code.

**Wrong (fake types just for tests):**
```typescript
// In test file:
interface Test14Model {  // ❌ FAKE - duplicates real model
  componentRoot: string;
  projectRoot: string;
  // ... arbitrary test-specific fields
}
```

**Correct (import real types):**
```typescript
// In test file:
import { Web4TSComponentModel } from '../../src/ts/layer3/Web4TSComponentModel.interface.js';
import { DefaultWeb4TSComponent } from '../../src/ts/layer2/DefaultWeb4TSComponent.js';

// Use the REAL types:
const component = new DefaultWeb4TSComponent();
await component.init();
```

**Test Pattern for componentDescriptorUpdate:**
```typescript
// 1. Check if descriptor exists
// 2. If yes, delete it
// 3. Run componentDescriptorUpdate() — REAL method
// 4. Verify descriptor was created with correct format
```

**Principle:** Tests that use fake types can pass even when real code is broken. Tests that use real code catch real bugs.

**Future PDCA:** Test Migration with P27 (Real Types Only) as key principle.

### **L27: Reference<T> Dereferencing — IOR → Scenario → Instance**
**Date:** 2025-12-22  
**Source:** User guidance on Reference semantics  
**Lesson:** Reference<T> can hold THREE states (IOR = Internet Object REFERENCE):

```typescript
Reference<T> can hold:
├── string         │ IOR string — can LOAD scenario
├── Scenario<M>    │ Scenario JSON — can INSTANTIATE component  
├── T              │ Instance — DEREFERENCED (ready to use)
└── null           │ Not set

Dereferencing Chain:
  IOR string → Scenario → Instance (dereferenced)
       ↓           ↓           ↓
  "ior:..."    { model }   DefaultFile
```

**ONE LAYER LOOKAHEAD Pattern:**
- Folder "resolved" = children ARE dereferenced instances (prefetched)
- Children's children = still IOR strings (not resolved yet)
- Selection (via ItemView or variable assignment) triggers next layer resolution
- Process deepens one layer at a time

**NOT File-Specific — Universal for ALL UcpComponents:**
- File/Folder are the REFERENCE IMPLEMENTATION
- Kernel knows: `loadScenario(ior)` → `instantiate(scenario)` → Instance
- Works for Reference<DefaultUser>, Reference<DefaultServer>, Reference<AnyUcpComponent>

**Reference PDCAs:**
- [§/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md](./2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md) | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-0400.file-folder-architecture-completion.pdca.md)
- [§/session/2025-12-22-UTC-0500.ffm-implementation.pdca.md](./2025-12-22-UTC-0500.ffm-implementation.pdca.md) | [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/session/2025-12-22-UTC-0500.ffm-implementation.pdca.md)

---

## **🔴 Common Web4 Violations Found**

### **V1: Non-Empty Constructor (P6 Violation)**
**Pattern:** Constructor initializes model with default values  
**Wrong:**
```typescript
constructor() {
    this.model = { uuid: '', name: 'X', ... };  // ❌
}
```
**Correct:**
```typescript
constructor() {
    // Empty - P6 compliant
}

init(scenario?: Scenario<TModel>): this {
    this.model = scenario?.model ?? this.modelDefault();  // ✅
    return this;
}

protected modelDefault(): TModel {
    return { uuid: this.uuidCreate(), name: 'X', ... };
}
```

### **V2: Async in Layer 2 (P7 Violation)**
**Pattern:** Layer 2 Implementation classes have async methods  
**Wrong:**
```typescript
// layer2/HTTPSLoader.ts
public async load(ior: string): Promise<string> { ... }  // ❌
```
**Correct:** Move async operations to Layer 4 Orchestrator, or keep transport-level async in dedicated async layer.  
**Note:** Transport loaders may be exception - network I/O is inherently async. Document as intentional deviation.

### **V3: Multiple Types in One File (P19 Violation)**
**Pattern:** Interface defined in same file as class  
**Wrong:**
```typescript
// HTTPSLoader.ts
interface IORProfile { ... }  // ❌ Should be separate file
export class HTTPSLoader { ... }
```
**Correct:** Create `IORProfile.interface.ts` in layer3.

---

## **📚 Reference Links**

| Topic | Link |
|-------|------|
| **Web4 Principles** | [§/session/web4-principles-checklist.md](./web4-principles-checklist.md) |
| **Web4 Details** | [§/session/web4-principles-details.md](./web4-principles-details.md) |
| **Fractal PDCA** | [§/scrum.pmo/.../howto.fractal.pdca.md](../../../../../Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md) |

---

**"Learn once, link forever."** 📚✨

