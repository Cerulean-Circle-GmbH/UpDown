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

