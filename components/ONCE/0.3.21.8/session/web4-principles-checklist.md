# 🔴 Web4 Principles Checklist

**Purpose:** CHECK BEFORE EVERY COMMIT during fractal PDCA execution.

**Usage:** 
1. Reference this file in every PDCA CHECK section
2. REREAD DEEPLY before each commit (not just skim!)
3. When you find a good example of a principle, ADD a dual link here (lazy update)

**Lazy Update Protocol:**
- When you encounter a perfect example of any principle → add dual link here
- Use `pdca getDualLink <file>` to generate correct format
- This checklist grows with good examples over time

---

## Core Principles

### **Principle 1: Everything is a Scenario**
> "There is NO difference between configuration and a scenario. Scenarios are the full state and the configuration with the IOR."

- [ ] No separate config objects (like `ONCE_DEFAULT_CONFIG`)
- [ ] All state stored as scenarios with IOR + owner + model

**Example:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.2/session/2025-11-19-UTC-1745.component-refactor-final.pdca.md) | [§/components/ONCE/0.3.21.2/session/2025-11-19-UTC-1745.component-refactor-final.pdca.md](../../../0.3.21.2/session/2025-11-19-UTC-1745.component-refactor-final.pdca.md) (Lines 277-307)

---

### **Principle 2: Convention over Configuration**
> Direct mapping (enum → method name), no switch/case statements.

- [ ] No switch/case statements for type dispatch
- [ ] Direct method invocation via naming convention

**Example:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts) | [§/components/Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts](../../../../Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts)

---

### **Principle 3: Web4 Naming Conventions**
> No underscores, camelCase for variables/methods, PascalCase for classes.

- [ ] No `__filename`, `__dirname`
- [ ] No snake_case variables
- [ ] CamelCase methods, PascalCase classes

---

### **Principle 4: TRUE Radical OOP Discipline**
> Objects over functions. No functional programming patterns.

- [ ] No standalone functions (wrap in classes)
- [ ] No functional factories
- [ ] State belongs to objects, not closures
- [ ] **Wrap libraries like Chai in OOP methods** (e.g., `this.expect()`, `this.assert()`)
- [ ] **Use Web4Requirement for acceptance criteria** (not arrow functions!)

**Example 1 (Chai in OOP):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/test/tootsie/ONCETestCase.ts) | [§/components/ONCE/0.3.21.8/test/tootsie/ONCETestCase.ts](../test/tootsie/ONCETestCase.ts) (Lines 199-237)

**Example 2 (Web4Requirement):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts) | [§/components/Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts](../../../../Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts) (Lines 75-145)

---

### **Principle 5: Reference<T> for Nullable References**
> Use Reference<T> pattern instead of `| undefined` or `| null`.

- [ ] No `property?: Type` without Reference<T>

---

### **Principle 6: Empty Constructor Makes Factories Obsolete**
> Empty constructor + init(scenario) pattern. init() is responsible for COMPLETE initialization.

- [ ] Constructor has NO parameters
- [ ] All initialization via `init(scenario)`
- [ ] No factory methods needed
- [ ] **init() generates UUID if not provided** (don't patch afterwards!)

**Example 1:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/Web4Test/0.3.20.6/src/ts/layer2/DefaultWeb4TestCase.ts) | [§/components/Web4Test/0.3.20.6/src/ts/layer2/DefaultWeb4TestCase.ts](../../../../Web4Test/0.3.20.6/src/ts/layer2/DefaultWeb4TestCase.ts)

**Example 2 (UUID in init):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/src/ts/layer2/IORMethodRouter.ts) | [§/components/ONCE/0.3.21.8/src/ts/layer2/IORMethodRouter.ts](../src/ts/layer2/IORMethodRouter.ts) (Lines 74-91)

---

### **Principle 7: Async Only in Layer 4**
> Layers 1-3 are synchronous. Only Layer 4 (orchestration) uses async.

- [ ] No async in Layer 1-3 classes

---

### **Principle 8: DRY - Don't Repeat Yourself**
> Dedicated methods, cross-reference instead of copy.

- [ ] No duplicated code
- [ ] Reference existing implementations
- [ ] **Shared node_modules** - components install to project root, then symlink

**Example (shared deps):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/src/sh/install-deps.sh) | [§/components/ONCE/0.3.21.8/src/sh/install-deps.sh](../src/sh/install-deps.sh) (Lines 94-115)

---

### **Principle 9: Self-Information Protocol**
> Use `pdca trainAI <topic>` when uncertain.

- [ ] Query trainAI before assuming
- [ ] Read documentation before implementing

---

### **Principle 10: Global ONCE Singleton Pattern**
> Single ONCE kernel instance per runtime.

---

### **Principle 11: Protocol-Less Communication**
> Tests and components don't know about HTTP/WS/protocols.

- [ ] No HTTP-specific code in business logic
- [ ] Communication via scenarios and IORs

---

### **Principle 12: IOR-based Method Invocation**
> Methods invoked via Internet Object References.

---

### **Principle 13: P2P Kernel Everywhere**
> Every peer is a kernel, no client/server distinction.

---

### **Principle 14: Unified Kernel Architecture**
> Single kernel pattern across all environments.

---

### **Principle 15: NO Output Filtering** ⚠️
> Never use `| head`, `| tail`, `| grep` to hide output.

- [ ] Show ALL output, no truncation
- [ ] No `head -20` or similar

---

### **Principle 16: Object-Action Method Naming**
> Pattern: `{noun}{verb}()` groups methods by domain object.

- [ ] `componentDescriptorUpdate()` NOT `updateComponentDescriptor()`
- [ ] Methods grouped by object they operate on

---

### **Principle 17: Component Instance Pattern**
> Components are versioned folders. `static start()` builds/compiles.

- [ ] Components in `components/{Name}/{Version}/`
- [ ] Instances created via scenarios

---

### **Principle 18: Black-Box Testing Only**
> Tests use IOR calls (protocol-agnostic). No white-box tests.

- [ ] Tests don't know about HTTP/WS internals
- [ ] Test via public interfaces only

**Example:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/test/tootsie/Test01_PathAuthorityAndProjectRootDetection.ts) | [§/components/ONCE/0.3.21.8/test/tootsie/Test01_PathAuthorityAndProjectRootDetection.ts](../test/tootsie/Test01_PathAuthorityAndProjectRootDetection.ts)

---

### **Principle 19: One File One Type**
> Each file contains exactly one type (class/interface/enum).

- [ ] No inline interfaces in class files
- [ ] No multiple exports per file

**Example:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/Tootsie/0.3.20.6/src/ts/layer3/TestRunnerScenario.interface.ts) | [§/components/Tootsie/0.3.20.6/src/ts/layer3/TestRunnerScenario.interface.ts](../../../../Tootsie/0.3.20.6/src/ts/layer3/TestRunnerScenario.interface.ts)

---

### **Principle 20: ESM Only**
> Pure ECMAScript Modules. No CommonJS patterns.

- [ ] No `__filename`, `__dirname`
- [ ] No `require()`
- [ ] Use `import.meta.url` and `fileURLToPath`

---

### **Principle 21: Wrap Functional Node Built-ins**
> Use `import * as fs from 'fs'` (object namespace) not destructured imports.

- [ ] `fs.readFileSync()` NOT `readFileSync()`
- [ ] Functional built-ins wrapped in object context

---

## How to Use

1. **BEFORE every git commit:** Open this file and check ALL principles
2. **In PDCA CHECK section:** Reference this file with dual link
3. **When uncertain:** Run `pdca trainAI <topic>` to self-inform

---

**"Never 2 1 (TO ONE). Always 4 2 (FOR TWO)."** 🤝✨

