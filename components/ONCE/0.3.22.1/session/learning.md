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

