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

#### **P4a: Method References (No Arrow Functions)**

- [ ] No standalone functions (wrap in classes)
- [ ] No functional factories
- [ ] State belongs to objects, not closures
- [ ] **Wrap libraries like Chai in OOP methods** (e.g., `this.expect()`, `this.assert()`)
- [ ] **Use Web4Requirement for acceptance criteria** (not arrow functions!)
- [ ] **No arrow function callbacks** - pass method references instead:
  ```typescript
  // ❌ WRONG: Arrow function
  peers.forEach(peer => { this.render(peer); });
  
  // ❌ WRONG: Anonymous function
  peers.forEach(function(peer) { this.render(peer); });
  
  // ✅ CORRECT: Method reference (Radical OOP)
  peers.forEach(this.peerRender.bind(this));
  ```

#### **P4b: Polymorphism (Ask the Object, Don't Switch!)**

- [ ] **No switch/if on object type** - ask the object for its behavior
- [ ] **No lookup tables for type→value** - same anti-pattern as switch!
- [ ] **Each class defines its own behavior** via methods

```typescript
// ❌ WRONG: External switch/if on type
get routeIcon(): string {
  if (className.includes('Static')) return '📁';  // BAD!
  if (className.includes('IOR')) return '🔗';     // BAD!
}

// ❌ WRONG: Lookup table (same anti-pattern!)
const icons: Record<string, string> = {
  'StaticFileRoute': '📁',
  'IORRoute': '🔗'
};
return icons[className];

// ✅ CORRECT: Each class defines its own behavior (polymorphism)
class StaticFileRoute extends Route {
  public iconGet(): string { return '📁'; }
  public labelGet(): string { return '📁 Static Files'; }
}

class IORRoute extends Route {
  public iconGet(): string { return '🔗'; }
  public labelGet(): string { return '🔗 IOR Methods'; }
}

// Usage - just ASK THE OBJECT:
const icon = route.iconGet();    // Polymorphism!
const label = route.labelGet();  // Polymorphism!
```

**Example 1 (Chai in OOP):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/test/tootsie/ONCETestCase.ts) | [§/components/ONCE/0.3.21.8/test/tootsie/ONCETestCase.ts](../test/tootsie/ONCETestCase.ts) (Lines 199-237)

**Example 2 (Web4Requirement):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts) | [§/components/Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts](../../../../Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts) (Lines 75-145)

**PDCA Reference (Polymorphism):** [GitHub](https://github.com/2cuGitHub/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-12-UTC-1103.http-routes-display.pdca.md) | [§/components/ONCE/0.3.21.8/session/2025-12-12-UTC-1103.http-routes-display.pdca.md](./2025-12-12-UTC-1103.http-routes-display.pdca.md)

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

### **Principle 16: Object-Action Method Naming + TypeScript Accessors**
> Pattern: `{noun}{verb}()` groups methods by domain object. Use TypeScript getters/setters.

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

```typescript
// ❌ WRONG: Looks like a getter but has parameter
attributeGet(name: string): Reference<AttributeDescriptor>
typeGet(classConstructor: InterfaceConstructor): Reference<TypeDescriptor>

// ✅ CORRECT: Lookup methods with parameter
attributeLookup(name: string): Reference<AttributeDescriptor>
typeLookup(classConstructor: InterfaceConstructor): Reference<TypeDescriptor>
classFromName(name: string): Reference<InterfaceConstructor>
classFromIOR(ior: string): Reference<InterfaceConstructor>

// ✅ CORRECT: Getters without parameter
get implementations(): InterfaceConstructor[]
get size(): number
static get instance(): TypeRegistry
```

**Deprecated Patterns** (mark `@deprecated` for lazy migration when encountered):
| Old Pattern | New Pattern | Migration |
|-------------|-------------|-----------|
| `getXxx()` | `get xxx()` | Add getter, deprecate method |
| `xxxGet()` | `get xxx()` | Add getter, deprecate method |
| `xxxGet(param)` | `xxxLookup(param)` or `xxxFrom(param)` | Rename method |
| `setXxx(value)` | `set xxx(value)` | Add setter, deprecate method |
| `xxxSet(value)` | `set xxx(value)` | Add setter, deprecate method |
| `createXxx()` | `xxxCreate()` | Rename method |
| `updateXxx()` | `xxxUpdate()` | Rename method |
| `buildXxx()` | `xxxBuild()` | Rename method |
| `loadXxx()` | `xxxLoad()` | Rename method |
| `saveXxx()` | `xxxSave()` | Rename method |
| `deleteXxx()` | `xxxDelete()` | Rename method |

**Lazy Migration Protocol:**
1. When encountering old pattern → add `@deprecated` JSDoc with migration hint
2. Add new pattern alongside (for getters/setters)
3. Update callers incrementally over time
4. Remove deprecated method when all callers migrated

**Example (Path Authority getters):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts) | [§/components/Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts](../../../../Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts) (Lines 343-398)

**Example (Lookup methods):** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/src/ts/layer2/TypeRegistry.ts) | [§/components/ONCE/0.3.21.8/src/ts/layer2/TypeRegistry.ts](../src/ts/layer2/TypeRegistry.ts) (typeLookup, classFromName, classFromIOR)

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

### **Principle 22: Collection<T> for Arrays**
> Use Collection<T> interface instead of raw arrays `T[]`.

Like `Reference<T>` wraps nullable single values, `Collection<T>` wraps arrays with type-safe operations.

- [ ] No raw arrays `peers: Scenario[]` → use `peers: Collection<Scenario>`
- [ ] Collection provides: `add()`, `remove()`, `find()`, `forEach()`, `map()`, `filter()`
- [ ] Elements accessed via `at(index)` return `Reference<T>`

```typescript
// ❌ WRONG - raw array
private peers: Scenario[] = [];
const peers = this.model?.peers || [];

// ✅ CORRECT - Collection<T>
private peers: Collection<Scenario<ONCEModel>>;
const peers: Collection<Scenario<ONCEModel>> = this.model.peers;

// ❌ WRONG - arrow function callback
peers.forEach(peer => { this.peerRender(peer); });

// ✅ CORRECT - method reference (no arrow functions needed!)
peers.forEach(this.peerRender);  // Pass method directly
peers.forEach(this.peerRender.bind(this));  // If 'this' context needed
```

**Example:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-03-UTC-1200.mvc-lit3-views.pdca.md) | [§/components/ONCE/0.3.21.8/session/2025-12-03-UTC-1200.mvc-lit3-views.pdca.md](./2025-12-03-UTC-1200.mvc-lit3-views.pdca.md) (Collection.interface.ts section)

---

### **Principle 23: EAMD.ucp Virtual Root (Static Asset Serving)**
> All static assets served via virtual `/EAMD.ucp/` root path for absolute imports.

The browser needs predictable, absolute URLs for importing JavaScript modules, CSS, and other assets. The `/EAMD.ucp/` virtual route maps to the project root filesystem:

- `/EAMD.ucp/components/...` → `{projectRoot}/components/...`
- `/EAMD.ucp/scenarios/...` → `{projectRoot}/scenarios/...`

This enables:
1. **Absolute imports in browser** - No relative path hell (`../../dist/...`)
2. **Component-agnostic paths** - Works from any HTML page
3. **Consistent with filesystem** - Same structure as disk layout
4. **Future: Physical symlink** - Eventually `EAMD.ucp` becomes a real directory

```html
<!-- ✅ CORRECT - Absolute import via EAMD.ucp virtual root -->
<script type="module">
import { ONCE } from '/EAMD.ucp/components/ONCE/0.3.21.8/dist/ts/layer1/ONCE.js';
import { CSSLoader } from '/EAMD.ucp/components/ONCE/0.3.21.8/dist/ts/layer2/CSSLoader.js';
</script>

<!-- ❌ WRONG - Relative paths break depending on where HTML is served -->
<script type="module">
import { ONCE } from '../../dist/ts/layer1/ONCE.js';  // Breaks!
</script>
```

- [ ] StaticFileRoute serves `/EAMD.ucp/components/**` as static files
- [ ] StaticFileRoute serves `/EAMD.ucp/scenarios/**` as static files
- [ ] HTML pages use absolute `/EAMD.ucp/...` imports
- [ ] FUTURE: Create physical `EAMD.ucp` symlink directory

**PDCA Reference:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md) | [§/components/ONCE/0.3.21.8/session/2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md](./2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md)

---

### **Principle 24: RelatedObjects Registry**
> UcpController registry for discovering related infrastructure objects by interface.

- [ ] Register component instances: `controller.relatedObjectRegister(InterfaceType, instance)`
- [ ] Auto-registers parent interfaces (OncePeerItemView → ItemView → View)
- [ ] Lookup returns all matching: `controller.relatedObjectLookup(View)` → all views

```typescript
// Registration
controller.relatedObjectRegister(OncePeerItemView, viewInstance);

// Lookup (polymorphic)
const views = controller.relatedObjectLookup(View);       // All views
const items = controller.relatedObjectLookup(ItemView);   // All ItemViews
```

**PDCA Reference:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md) | [§Phase A.1](./2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md)

---

### **Principle 25: Tootsie Tests Only**
> No Vitest/Jest functional tests. Only Radical OOP Tootsie tests.

- [ ] Tests are classes extending `ONCETestCase` or `DefaultWeb4TestCase`
- [ ] No `describe()` / `it()` functional patterns
- [ ] Tests are scenarios (hibernatable, discoverable)

```typescript
// ✅ CORRECT - Radical OOP Test
class Test05 extends ONCETestCase {
  async executeTestLogic(): Promise<any> {
    // test implementation
  }
}

// ❌ WRONG - Functional test
describe('Test05', () => {
  it('should work', () => { ... });
});
```

**PDCA Reference:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md) | [§Phase A.1](./2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md)

---

### **Principle 26: No Factory Functions - Class + init() Only**
> Factory functions violate Radical OOP. Always use `new Class().init(scenario)`.

- [ ] No `createXyz()` factory functions
- [ ] All instantiation via `new Class().init(scenario)`
- [ ] Constructor handles defaults, init() handles async setup

```typescript
// ❌ WRONG - Factory function (functional programming)
const route = routeScenarioCreate('/', 'view-tag');

// ✅ CORRECT - Radical OOP
const route = await new Route().init({
  model: { pattern: '/', viewTag: 'view-tag' }
});
```

**PDCA Reference:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md) | [§SPA Cleanup](./2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md)

---

### **Principle 27: Web Components ARE Radical OOP**
> HTML declarative syntax IS object instantiation. No impedance mismatch.

**Tag = Class Instantiation:**
```html
<my-view name="Dashboard" count="5"></my-view>
```
```typescript
// Is IDENTICAL to:
const view = await new MyView().init({ model: { name: 'Dashboard', count: 5 } });
```

**Nesting = Composition via add():**
```html
<parent-view>
  <child-view name="Item1"></child-view>
</parent-view>
```
```typescript
// Is IDENTICAL to:
const parent = await new ParentView().init({});
const child = await new ChildView().init({ model: { name: 'Item1' } });
parent.add(child);  // Web4 API (not childAdd)
```

**Tag → Implementation Mapping:**
- `<tag>` instantiates `DefaultTag` (or configured implementationClass)
- `<once>` → `NodeJsOnce` (server) / `BrowserOnce` (browser)

**View Naming Convention:**
| Pattern | Purpose | Contains |
|---------|---------|----------|
| `<tag-item-view>` | Single item | Model visualization |
| `<tag-default-view>` | Default/detail | Full model details |
| `<tag-over-view>` | Overview | `Collection<ItemView>` |

**Adapter Pattern:**
- Web4 API: `add()` / `remove()` - framework-agnostic
- Implementation adapts to Lit/React/Vue/vanilla DOM

```typescript
// UcpView.add() - Web4 interface
add(child: UcpView): void {
  this.renderRoot.appendChild(child);  // Adapter to Lit/DOM
  this.items.add(child);               // Track in collection
}
```

- [ ] Use `add(item)` for composition (not `childAdd`)
- [ ] `<tag-over-view>` contains `Collection<ItemView>`
- [ ] Attributes map to `model.{attributeName}`
- [ ] `connectedCallback()` = `init()` completion

```
Web4 API vs Implementation
┌─────────────────────────────────────────────┐
│  Web4 Consumer Code                         │
│  parent.add(child)  ← Framework-agnostic    │
└─────────────────────────────────────────────┘
                    │
                    ▼ Adapter Pattern
┌────────────────────────────────────────────────┐
│  UcpView Implementation                        │
│  add(child: UcpView): void {                   │
│    this.renderRoot.appendChild(child); // Lit  │
│    this.items.add(child);              // Track│
│  }                                             │
└────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
       Lit        React        Vue
    appendChild  children     slots
```
Key Insight
Web4 API: add() / remove() - what consumers use
Implementation: Adapts to underlying framework
Benefit: Same Web4 code works with any UI framework

**PDCA Reference:** [GitHub](https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md) | [§SPA Cleanup](./2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md)

---

### **Principle 28: JsInterface Pattern - Object IS Its Type**
> In JavaScript/TypeScript, the object IS its type. No redundant enums or type discriminators needed.

The class hierarchy IS the type system. Use `constructor.name` and `instanceof` instead of type fields or enums.

#### **No Type Enums**

- [ ] **No redundant type enums** - class hierarchy IS the type
- [ ] **No `type` discriminator fields** - use `instanceof` or `constructor.name`
- [ ] **Serialize `className`** when sending objects over HTTP

```typescript
// ❌ WRONG: Redundant enum duplicates class type information
enum RouteType { SPA, STATIC, IOR, HTML, SCENARIO }

interface RouteModel {
  type: RouteType;  // Redundant! The class already tells us the type!
}

if (route.type === RouteType.STATIC) { ... }  // Double maintenance!

// ✅ CORRECT: Class hierarchy IS the type system
route.constructor.name           // "StaticFileRoute"
route instanceof StaticFileRoute // true

// Type check without enum:
if (route instanceof StaticFileRoute) { ... }
```

#### **Serialize className for HTTP**

When serializing objects (e.g., JSON response), include `className`:

```typescript
// Server serializes with className (JsInterface pattern)
private routeModelExtract(route: Route): object {
  return {
    pattern: route.model.pattern,
    className: route.constructor.name,  // JsInterface: serialize type
    icon: route.iconGet(),              // Polymorphism: ask object
    label: route.labelGet()             // Polymorphism: ask object
  };
}
```

#### **Runtime Type Access**

```typescript
// Get type name
const typeName = object.constructor.name;

// Type check
if (object instanceof SpecificClass) { ... }

// Get all implemented interfaces (future: via TypeRegistry)
const interfaces = TypeRegistry.interfacesOf(object);
```

#### **Why JsInterface?**

| Approach | Problem |
|----------|---------|
| Enums | Duplicate information, manual sync, no polymorphism |
| Type fields | Same issues, plus storage overhead |
| **JsInterface** | Single source of truth (the class), enables polymorphism |

**PDCA Reference:** [GitHub](https://github.com/2cuGitHub/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/2025-12-12-UTC-1103.http-routes-display.pdca.md) | [§/components/ONCE/0.3.21.8/session/2025-12-12-UTC-1103.http-routes-display.pdca.md](./2025-12-12-UTC-1103.http-routes-display.pdca.md)

---

## How to Use

1. **BEFORE every git commit:** Open this file and check ALL principles
2. **In PDCA CHECK section:** Reference this file with dual link
3. **When uncertain:** Run `pdca trainAI <topic>` to self-inform

---

**"Never 2 1 (TO ONE). Always 4 2 (FOR TWO)."** 🤝✨

