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
- [ ] No separate config objects (like `ONCE_DEFAULT_CONFIG`)
- [ ] All state stored as scenarios with IOR + owner + model

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-1-everything-is-a-scenario)  
**Examples:** [2025-11-19-UTC-1745.component-refactor-final.pdca.md](./2025-11-19-UTC-1745.component-refactor-final.pdca.md) (Lines 277-307)

---

### **Principle 2: Convention over Configuration**
- [ ] No switch/case statements for type dispatch
- [ ] Direct method invocation via naming convention

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-2-convention-over-configuration)  
**Examples:** [DefaultWeb4TSComponent.ts](../../../../Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts)

---

### **Principle 3: Web4 Naming Conventions**
- [ ] No `__filename`, `__dirname`
- [ ] No snake_case variables
- [ ] CamelCase methods, PascalCase classes

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-3-web4-naming-conventions)

---

### **Principle 4: TRUE Radical OOP Discipline**

#### **P4a: Method References (No Arrow Functions)**
- [ ] No standalone functions (wrap in classes)
- [ ] No functional factories
- [ ] State belongs to objects, not closures
- [ ] Wrap libraries like Chai in OOP methods (e.g., `this.expect()`, `this.assert()`)
- [ ] Use Web4Requirement for acceptance criteria (not arrow functions!)
- [ ] No arrow function callbacks - pass method references instead

**Details:** [web4-principles-details.md](./web4-principles-details.md#p4a-method-references-no-arrow-functions)  
**Examples:** [ONCETestCase.ts](../test/tootsie/ONCETestCase.ts) (Lines 199-237) | [DefaultWeb4Requirement.ts](../../../../Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts) (Lines 75-145)

#### **P4b: Polymorphism (Ask the Object, Don't Switch!)**
- [ ] No switch/if on object type - ask the object for its behavior
- [ ] No lookup tables for type→value - same anti-pattern as switch!
- [ ] Each class defines its own behavior via methods

**Details:** [web4-principles-details.md](./web4-principles-details.md#p4b-polymorphism-ask-the-object-dont-switch)  
**Examples:** [2025-12-12-UTC-1103.http-routes-display.pdca.md](./2025-12-12-UTC-1103.http-routes-display.pdca.md) | [2025-12-11-UTC-1300.agent-context-recovery.md](./2025-12-11-UTC-1300.agent-context-recovery.md)

---

### **Principle 5: Reference<T> for Nullable References**
- [ ] No `property?: Type` without Reference<T>

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-5-referencet-for-nullable-references)

---

### **Principle 6: Empty Constructor Makes Factories Obsolete**
- [ ] Constructor has NO parameters
- [ ] All initialization via `init(scenario)`
- [ ] No factory methods needed
- [ ] `init()` generates UUID if not provided (don't patch afterwards!)

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-6-empty-constructor-makes-factories-obsolete)  
**Examples:** [DefaultWeb4TestCase.ts](../../../../Web4Test/0.3.20.6/src/ts/layer2/DefaultWeb4TestCase.ts) | [IORMethodRouter.ts](../src/ts/layer2/IORMethodRouter.ts) (Lines 74-91) | [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

### **Principle 7: Async Only in Layer 4**
- [ ] No async in Layer 1-3 classes

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-7-async-only-in-layer-4)  
**Examples:** [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

### **Principle 8: DRY - Don't Repeat Yourself**
- [ ] No duplicated code
- [ ] Reference existing implementations
- [ ] Shared node_modules - components install to project root, then symlink

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-8-dry---dont-repeat-yourself)  
**Examples:** [install-deps.sh](../src/sh/install-deps.sh) (Lines 94-115) | [2025-12-12-UTC-2100.iteration-08-testing.pdca.md](./2025-12-12-UTC-2100.iteration-08-testing.pdca.md)

---

### **Principle 9: Self-Information Protocol**
- [ ] Query trainAI before assuming
- [ ] Read documentation before implementing

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-9-self-information-protocol)

---

### **Principle 10: Global ONCE Singleton Pattern**
- [ ] Single ONCE kernel instance per runtime

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-10-global-once-singleton-pattern)

---

### **Principle 11: Protocol-Less Communication**
- [ ] No HTTP-specific code in business logic
- [ ] Communication via scenarios and IORs

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-11-protocol-less-communication)

---

### **Principle 12: IOR-based Method Invocation**
- [ ] Methods invoked via Internet Object References

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-12-ior-based-method-invocation)

---

### **Principle 13: P2P Kernel Everywhere**
- [ ] Every peer is a kernel, no client/server distinction

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-13-p2p-kernel-everywhere)

---

### **Principle 14: Unified Kernel Architecture**
- [ ] Single kernel pattern across all environments

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-14-unified-kernel-architecture)

---

### **Principle 15: NO Output Filtering** ⚠️
- [ ] Show ALL output, no truncation
- [ ] No `head -20` or similar

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-15-no-output-filtering-)

---

### **Principle 16: Object-Action Method Naming + TypeScript Accessors**

**Method Naming (nameVerb pattern):**
- [ ] `componentDescriptorUpdate()` NOT `updateComponentDescriptor()`
- [ ] `thisAndThatCreate()` NOT `createThisAndThat()`
- [ ] `dependenciesBuild()` NOT `buildDependencies()`
- [ ] Methods grouped by object they operate on

**TypeScript Accessors (no parameter = getter/setter):**
- [ ] Use `get propertyName()` NOT `getPropertyName()` or `propertyNameGet()`
- [ ] Use `set propertyName(value)` NOT `setPropertyName(value)` or `propertyNameSet(value)`
- [ ] Properties accessed as `this.propertyName` NOT `this.getPropertyName()`

**Parameterized Lookups (with parameter = lookup method):**
- [ ] Use `xyzLookup(param)` when searching by a key/parameter
- [ ] Use `xyzFrom(param)` when converting/deriving from a source
- [ ] **NOT** `xyzGet(param)` - that's a getter disguised as a method!

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-16-object-action-method-naming--typescript-accessors)  
**Examples:** [DefaultWeb4TSComponent.ts](../../../../Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts) (Lines 343-398) | [TypeRegistry.ts](../src/ts/layer2/TypeRegistry.ts) | [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

### **Principle 17: Component Instance Pattern**
- [ ] Components in `components/{Name}/{Version}/`
- [ ] Instances created via scenarios

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-17-component-instance-pattern)

---

### **Principle 18: Black-Box Testing Only**
- [ ] Tests don't know about HTTP/WS internals
- [ ] Test via public interfaces only

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-18-black-box-testing-only)  
**Examples:** [Test01_PathAuthorityAndProjectRootDetection.ts](../test/tootsie/Test01_PathAuthorityAndProjectRootDetection.ts)

---

### **Principle 19: One File One Type**
- [ ] No inline interfaces in class files
- [ ] No multiple exports per file

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-19-one-file-one-type)  
**Examples:** [TestRunnerScenario.interface.ts](../../../../Tootsie/0.3.20.6/src/ts/layer3/TestRunnerScenario.interface.ts) | [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

### **Principle 20: ESM Only**
- [ ] No `__filename`, `__dirname`
- [ ] No `require()`
- [ ] Use `import.meta.url` and `fileURLToPath`

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-20-esm-only)

---

### **Principle 21: Wrap Functional Node Built-ins**
- [ ] `fs.readFileSync()` NOT `readFileSync()`
- [ ] Functional built-ins wrapped in object context

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-21-wrap-functional-node-built-ins)

---

### **Principle 22: Collection<T> for Arrays**
- [ ] No raw arrays `peers: Scenario[]` → use `peers: Collection<Scenario>`
- [ ] Collection provides: `add()`, `remove()`, `find()`, `forEach()`, `map()`, `filter()`
- [ ] Elements accessed via `at(index)` return `Reference<T>`

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-22-collectiont-for-arrays)  
**Examples:** [2025-12-03-UTC-1200.mvc-lit3-views.pdca.md](./2025-12-03-UTC-1200.mvc-lit3-views.pdca.md)

---

### **Principle 23: EAMD.ucp Virtual Root (Static Asset Serving)**
- [ ] StaticFileRoute serves `/EAMD.ucp/components/**` as static files
- [ ] StaticFileRoute serves `/EAMD.ucp/scenarios/**` as static files
- [ ] HTML pages use absolute `/EAMD.ucp/...` imports
- [ ] FUTURE: Create physical `EAMD.ucp` symlink directory

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-23-eamducp-virtual-root-static-asset-serving)  
**Examples:** [2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md](./2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md) | [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

### **Principle 24: RelatedObjects Registry**
- [ ] Register component instances: `controller.relatedObjectRegister(InterfaceType, instance)`
- [ ] Auto-registers parent interfaces (OncePeerItemView → ItemView → View)
- [ ] Lookup returns all matching: `controller.relatedObjectLookup(View)` → all views

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-24-relatedobjects-registry)  
**Examples:** [2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md](./2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md)

---

### **Principle 25: Tootsie Tests Only**
- [ ] Tests are classes extending `ONCETestCase` or `DefaultWeb4TestCase`
- [ ] No `describe()` / `it()` functional patterns
- [ ] Tests are scenarios (hibernatable, discoverable)

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-25-tootsie-tests-only)  
**Examples:** [2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md](./2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md)

---

### **Principle 26: No Factory Functions - Class + init() Only**
- [ ] No `createXyz()` factory functions
- [ ] All instantiation via `new Class().init(scenario)`
- [ ] Constructor handles defaults, init() handles async setup

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-26-no-factory-functions---class--init-only)  
**Examples:** [2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md](./2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md)

---

### **Principle 27: Web Components ARE Radical OOP**
- [ ] Use `add(item)` for composition (not `childAdd`)
- [ ] `<tag-over-view>` contains `Collection<ItemView>`
- [ ] Attributes map to `model.{attributeName}`
- [ ] `connectedCallback()` = `init()` completion

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-27-web-components-are-radical-oop)  
**Examples:** [2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md](./2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md)

---

### **Principle 28: JsInterface Pattern - Object IS Its Type**
- [ ] No redundant type enums - class hierarchy IS the type
- [ ] No `type` discriminator fields - use `instanceof` or `constructor.name`
- [ ] Serialize `className` when sending objects over HTTP

**Details:** [web4-principles-details.md](./web4-principles-details.md#principle-28-jsinterface-pattern---object-is-its-type)  
**Examples:** [2025-12-12-UTC-1103.http-routes-display.pdca.md](./2025-12-12-UTC-1103.http-routes-display.pdca.md) | [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

## How to Use

1. **BEFORE every git commit:** Open this file and check ALL principles
2. **In PDCA CHECK section:** Reference this file with dual link
3. **When uncertain:** Run `pdca trainAI <topic>` to self-inform

---

**"Never 2 1 (TO ONE). Always 4 2 (FOR TWO)."** 🤝✨
