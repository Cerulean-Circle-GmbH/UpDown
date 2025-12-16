# Web4 Principles Details

This document contains the detailed explanations for all Web4 principles. Each principle section links back to the [checklist](./web4-principles-checklist.md) and includes code examples, rationale, and anti-patterns.

---

## Principle 1: Everything is a Scenario

> "There is NO difference between configuration and a scenario. Scenarios are the full state and the configuration with the IOR."

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-1-everything-is-a-scenario)

### Details

In Web4, there is no separate configuration system. Everything is a scenario:
- Scenarios contain IOR (Internet Object Reference), owner, and model
- Configuration data is stored as scenarios
- State persistence uses scenarios
- No separate config objects like `ONCE_DEFAULT_CONFIG`

### Why

- **Single source of truth:** All state in one format
- **Hibernation:** Scenarios can be saved/restored
- **IOR-based:** Every object can be referenced via IOR
- **Consistency:** Same pattern for all data

### Anti-Patterns

❌ **WRONG:** Separate config object
```typescript
const ONCE_DEFAULT_CONFIG = { port: 8080, host: 'localhost' };
```

✅ **CORRECT:** Configuration as scenario
```typescript
const configScenario = {
  ior: 'once://localhost:8080/config',
  owner: 'system',
  model: { port: 8080, host: 'localhost' }
};
```

### Examples

- **PDCA:** [2025-11-19-UTC-1745.component-refactor-final.pdca.md](./2025-11-19-UTC-1745.component-refactor-final.pdca.md) (Lines 277-307)

---

## Principle 2: Convention over Configuration

> Direct mapping (enum → method name), no switch/case statements.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-2-convention-over-configuration)

### Details

Use naming conventions to map types to methods directly, avoiding switch/case statements:
- Enum values map directly to method names
- Method invocation via naming convention
- No conditional dispatch logic

### Why

- **Less code:** No switch/case maintenance
- **Extensibility:** Add new types by adding methods
- **Type safety:** Compiler catches missing methods
- **Clear intent:** Method name describes behavior

### Anti-Patterns

❌ **WRONG:** Switch/case dispatch
```typescript
switch (type) {
  case 'create': return createMethod();
  case 'update': return updateMethod();
}
```

✅ **CORRECT:** Direct method invocation
```typescript
const method = this[`${type}Method`];
method();
```

### Examples

- **Code:** [DefaultWeb4TSComponent.ts](../../../../Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts)

---

## Principle 3: Web4 Naming Conventions

> No underscores, camelCase for variables/methods, PascalCase for classes.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-3-web4-naming-conventions)

### Details

- **No `__filename`, `__dirname`** - Use `import.meta.url` and `fileURLToPath` instead
- **No snake_case variables** - Use camelCase
- **CamelCase methods** - `myMethod()`, `getValue()`
- **PascalCase classes** - `MyClass`, `DefaultComponent`

### Why

- **Consistency:** Single naming style across codebase
- **JavaScript/TypeScript conventions:** Aligns with language standards
- **ESM compatibility:** `__filename`/`__dirname` are CommonJS

### Anti-Patterns

❌ **WRONG:** Node.js CommonJS patterns
```typescript
const path = require('path');
const filename = __filename;
```

✅ **CORRECT:** ESM patterns
```typescript
import { fileURLToPath } from 'url';
const filename = fileURLToPath(import.meta.url);
```

---

## P4a: Method References (No Arrow Functions)

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#p4a-method-references-no-arrow-functions)

### Details

Radical OOP means objects over functions:
- No standalone functions - wrap in classes
- No functional factories
- State belongs to objects, not closures
- Wrap libraries like Chai in OOP methods (e.g., `this.expect()`, `this.assert()`)
- Use Web4Requirement for acceptance criteria (not arrow functions!)
- No arrow function callbacks - pass method references instead

### Why

- **Object-oriented:** Everything is an object
- **Testability:** Methods can be stubbed/mocked
- **State management:** State lives in objects, not closures
- **Consistency:** Single pattern for all callbacks

### Anti-Patterns

❌ **WRONG:** Arrow function callback
```typescript
peers.forEach(peer => { this.render(peer); });
```

❌ **WRONG:** Anonymous function
```typescript
peers.forEach(function(peer) { this.render(peer); });
```

✅ **CORRECT:** Method reference (Radical OOP)
```typescript
peers.forEach(this.peerRender.bind(this));
```

### Examples

- **Chai in OOP:** [ONCETestCase.ts](../test/tootsie/ONCETestCase.ts) (Lines 199-237)
- **Web4Requirement:** [DefaultWeb4Requirement.ts](../../../../Web4Requirement/0.3.20.6/src/ts/layer2/DefaultWeb4Requirement.ts) (Lines 75-145)

---

## P4b: Polymorphism (Ask the Object, Don't Switch!)

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#p4b-polymorphism-ask-the-object-dont-switch)

### Details

Use polymorphism instead of external type checking:
- **No switch/if on object type** - ask the object for its behavior
- **No lookup tables for type→value** - same anti-pattern as switch!
- **Each class defines its own behavior** via methods

### Why

- **True OOP:** Behavior belongs to objects
- **Extensibility:** Add new types without modifying existing code
- **Single Responsibility:** Each class knows its own behavior
- **Type safety:** Compiler enforces method existence

### Anti-Patterns

❌ **WRONG:** External switch/if on type
```typescript
get routeIcon(): string {
  if (className.includes('Static')) return '📁';  // BAD!
  if (className.includes('IOR')) return '🔗';     // BAD!
}
```

❌ **WRONG:** Lookup table (same anti-pattern!)
```typescript
const icons: Record<string, string> = {
  'StaticFileRoute': '📁',
  'IORRoute': '🔗'
};
return icons[className];
```

✅ **CORRECT:** Each class defines its own behavior (polymorphism)
```typescript
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

### Examples

- **PDCA:** [2025-12-12-UTC-1103.http-routes-display.pdca.md](./2025-12-12-UTC-1103.http-routes-display.pdca.md)
- **Recovery:** [2025-12-11-UTC-1300.agent-context-recovery.md](./2025-12-11-UTC-1300.agent-context-recovery.md)

---

## Principle 5: Reference<T> for Nullable References

> Use Reference<T> pattern instead of `| undefined` or `| null`.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-5-referencet-for-nullable-references)

### Details

Like `Optional<T>` in Java, `Reference<T>` wraps nullable values:
- No `property?: Type` without Reference<T>
- `Reference<T>` provides `.hasValue()`, `.valueGet()`, `.valueSet()`
- Type-safe null checking

### Why

- **Explicit nullability:** Makes nullability explicit in type system
- **Safe access:** Methods prevent null pointer exceptions
- **Consistency:** Single pattern for nullable references
- **Type safety:** Compiler enforces proper null checking

---

## Principle 6: Empty Constructor Makes Factories Obsolete

> Empty constructor + init(scenario) pattern. init() is responsible for COMPLETE initialization.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-6-empty-constructor-makes-factories-obsolete)

### Details

All classes use the same initialization pattern:
- Constructor has NO parameters
- All initialization via `init(scenario)`
- No factory methods needed
- **init() generates UUID if not provided** (don't patch afterwards!)

### Why

- **Consistency:** Same pattern for all objects
- **Flexibility:** Same class can be initialized with different scenarios
- **Hibernation:** Scenarios can be saved/restored
- **No factories:** Simplifies object creation

### Anti-Patterns

❌ **WRONG:** Constructor with parameters
```typescript
class Route {
  constructor(pattern: string, viewTag: string) {
    this.pattern = pattern;
  }
}
```

❌ **WRONG:** Factory function
```typescript
function createRoute(pattern: string) {
  return new Route(pattern);
}
```

✅ **CORRECT:** Empty constructor + init()
```typescript
class Route {
  constructor() {}  // Empty!
  
  async init(scenario: Scenario<RouteModel>): Promise<Route> {
    this.ior = scenario.ior || this.uuidGenerate();
    this.model = scenario.model;
    return this;
  }
}

// Usage:
const route = await new Route().init({
  model: { pattern: '/', viewTag: 'view-tag' }
});
```

### Examples

- **Code:** [DefaultWeb4TestCase.ts](../../../../Web4Test/0.3.20.6/src/ts/layer2/DefaultWeb4TestCase.ts)
- **UUID in init:** [IORMethodRouter.ts](../src/ts/layer2/IORMethodRouter.ts) (Lines 74-91)
- **PDCA:** [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

## Principle 7: Async Only in Layer 4

> Layers 1-3 are synchronous. Only Layer 4 (orchestration) uses async.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-7-async-only-in-layer-4)

### Details

Clear separation of concerns:
- **Layer 1 (Kernel):** Synchronous operations
- **Layer 2 (Components):** Synchronous business logic
- **Layer 3 (Interfaces):** Synchronous data structures
- **Layer 4 (Orchestration):** Async coordination

### Why

- **Simplicity:** Lower layers are easier to reason about
- **Testability:** Synchronous code is easier to test
- **Performance:** No async overhead in business logic
- **Clear boundaries:** Async only where coordination is needed

### Examples

- **PDCA:** [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

## Principle 8: DRY - Don't Repeat Yourself

> Dedicated methods, cross-reference instead of copy.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-8-dry---dont-repeat-yourself)

### Details

Avoid code duplication:
- No duplicated code
- Reference existing implementations
- **Shared node_modules** - components install to project root, then symlink

### Why

- **Maintainability:** Fix bugs in one place
- **Consistency:** Same behavior everywhere
- **Reduced bundle size:** Shared dependencies
- **Faster builds:** Shared compilation

### Examples

- **Shared deps:** [install-deps.sh](../src/sh/install-deps.sh) (Lines 94-115)
- **PDCA:** [2025-12-12-UTC-2100.iteration-08-testing.pdca.md](./2025-12-12-UTC-2100.iteration-08-testing.pdca.md)

---

## Principle 9: Self-Information Protocol

> Use `pdca trainAI <topic>` when uncertain.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-9-self-information-protocol)

### Details

When uncertain, query for information:
- Query trainAI before assuming
- Read documentation before implementing
- Use `pdca trainAI <topic>` command

### Why

- **Accuracy:** Avoid incorrect assumptions
- **Efficiency:** Learn before implementing
- **Consistency:** Use established patterns

---

## Principle 10: Global ONCE Singleton Pattern

> Single ONCE kernel instance per runtime.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-10-global-once-singleton-pattern)

### Details

- One ONCE kernel instance per runtime
- Shared across all components
- Accessed via singleton pattern

### Why

- **Resource efficiency:** Single kernel instance
- **State consistency:** Shared state across components
- **Simplified access:** Global access point

---

## Principle 11: Protocol-Less Communication

> Tests and components don't know about HTTP/WS/protocols.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-11-protocol-less-communication)

### Details

Business logic is protocol-agnostic:
- No HTTP-specific code in business logic
- Communication via scenarios and IORs
- Protocol layer handles transport details

### Why

- **Flexibility:** Same logic works with different protocols
- **Testability:** Test without HTTP servers
- **Abstraction:** Business logic independent of transport
- **Future-proof:** Easy to add new protocols

---

## Principle 12: IOR-based Method Invocation

> Methods invoked via Internet Object References.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-12-ior-based-method-invocation)

### Details

Methods are invoked using Internet Object References (IORs):
- IOR format: `protocol://host:port/objectId/method`
- Protocol-agnostic invocation
- Supports P2P communication

### Why

- **Location transparency:** Don't need to know object location
- **Network support:** Works across network boundaries
- **Uniform interface:** Same pattern for local and remote calls

---

## Principle 13: P2P Kernel Everywhere

> Every peer is a kernel, no client/server distinction.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-13-p2p-kernel-everywhere)

### Details

- Every peer runs a kernel
- No client/server distinction
- All peers are equal

### Why

- **Symmetry:** Same code for all peers
- **Resilience:** No single point of failure
- **Flexibility:** Peers can act as both client and server

---

## Principle 14: Unified Kernel Architecture

> Single kernel pattern across all environments.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-14-unified-kernel-architecture)

### Details

- Same kernel architecture across Node.js, browser, and other environments
- Unified API regardless of platform
- Platform-specific implementations behind interface

### Why

- **Code reuse:** Same business logic everywhere
- **Consistency:** Same behavior across platforms
- **Maintainability:** Single codebase to maintain

---

## Principle 15: NO Output Filtering ⚠️

> Never use `| head`, `| tail`, `| grep` to hide output.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-15-no-output-filtering-)

### Details

Show ALL output:
- No truncation with `head -20` or similar
- No filtering with `grep` to hide errors
- Complete information for debugging

### Why

- **Debugging:** Need full context to debug
- **Transparency:** Don't hide problems
- **Completeness:** All information visible

---

## Principle 16: Object-Action Method Naming + TypeScript Accessors

> Pattern: `{noun}{verb}()` groups methods by domain object. Use TypeScript getters/setters.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-16-object-action-method-naming--typescript-accessors)

### Details

**Method Naming (nameVerb pattern):**
- `componentDescriptorUpdate()` NOT `updateComponentDescriptor()`
- `thisAndThatCreate()` NOT `createThisAndThat()`
- `dependenciesBuild()` NOT `buildDependencies()`
- Methods grouped by object they operate on

**TypeScript Accessors (no parameter = getter/setter):**
- Use `get propertyName()` NOT `getPropertyName()` or `propertyNameGet()`
- Use `set propertyName(value)` NOT `setPropertyName(value)` or `propertyNameSet(value)`
- Properties accessed as `this.propertyName` NOT `this.getPropertyName()`

**Parameterized Lookups (with parameter = lookup method):**
- Use `xyzLookup(param)` when searching by a key/parameter
- Use `xyzFrom(param)` when converting/deriving from a source
- **NOT** `xyzGet(param)` - that's a getter disguised as a method!

### Anti-Patterns

❌ **WRONG:** Looks like a getter but has parameter
```typescript
attributeGet(name: string): Reference<AttributeDescriptor>
typeGet(classConstructor: InterfaceConstructor): Reference<TypeDescriptor>
```

✅ **CORRECT:** Lookup methods with parameter
```typescript
attributeLookup(name: string): Reference<AttributeDescriptor>
typeLookup(classConstructor: InterfaceConstructor): Reference<TypeDescriptor>
classFromName(name: string): Reference<InterfaceConstructor>
classFromIOR(ior: string): Reference<InterfaceConstructor>
```

✅ **CORRECT:** Getters without parameter
```typescript
get implementations(): InterfaceConstructor[]
get size(): number
static get instance(): TypeRegistry
```

### Deprecated Patterns

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

### Examples

- **Path Authority getters:** [DefaultWeb4TSComponent.ts](../../../../Web4TSComponent/0.3.20.6/src/ts/layer2/DefaultWeb4TSComponent.ts) (Lines 343-398)
- **Lookup methods:** [TypeRegistry.ts](../src/ts/layer2/TypeRegistry.ts)
- **PDCA:** [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

## Principle 17: Component Instance Pattern

> Components are versioned folders. `static start()` builds/compiles.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-17-component-instance-pattern)

### Details

- Components in `components/{Name}/{Version}/`
- Instances created via scenarios
- Versioning allows multiple versions to coexist

### Why

- **Versioning:** Multiple versions can coexist
- **Organization:** Clear component structure
- **Scenarios:** Instance configuration via scenarios

---

## Principle 18: Black-Box Testing Only

> Tests use IOR calls (protocol-agnostic). No white-box tests.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-18-black-box-testing-only)

### Details

Tests use public interfaces only:
- Tests don't know about HTTP/WS internals
- Test via public interfaces only
- Protocol-agnostic testing

### Why

- **Abstraction:** Tests focus on behavior, not implementation
- **Maintainability:** Implementation changes don't break tests
- **Realistic:** Tests reflect actual usage

### Examples

- **Code:** [Test01_PathAuthorityAndProjectRootDetection.ts](../test/tootsie/Test01_PathAuthorityAndProjectRootDetection.ts)

---

## Principle 19: One File One Type

> Each file contains exactly one type (class/interface/enum).

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-19-one-file-one-type)

### Details

- No inline interfaces in class files
- No multiple exports per file
- One type per file

### Why

- **Organization:** Easy to find types
- **Maintainability:** Changes are isolated
- **Clarity:** File name matches type name

### Examples

- **Code:** [TestRunnerScenario.interface.ts](../../../../Tootsie/0.3.20.6/src/ts/layer3/TestRunnerScenario.interface.ts)
- **PDCA:** [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

## Principle 20: ESM Only

> Pure ECMAScript Modules. No CommonJS patterns.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-20-esm-only)

### Details

- No `__filename`, `__dirname`
- No `require()`
- Use `import.meta.url` and `fileURLToPath`

### Why

- **Modern JavaScript:** ESM is the standard
- **Tree-shaking:** Better optimization
- **Consistency:** Single module system

### Anti-Patterns

❌ **WRONG:** CommonJS
```typescript
const path = require('path');
const filename = __filename;
```

✅ **CORRECT:** ESM
```typescript
import { fileURLToPath } from 'url';
const filename = fileURLToPath(import.meta.url);
```

---

## Principle 21: Wrap Functional Node Built-ins

> Use `import * as fs from 'fs'` (object namespace) not destructured imports.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-21-wrap-functional-node-built-ins)

### Details

- `fs.readFileSync()` NOT `readFileSync()`
- Functional built-ins wrapped in object context
- Import entire module, don't destructure

### Why

- **OOP consistency:** Functions are methods on objects
- **Namespace clarity:** Clear where function comes from
- **Consistency:** Same pattern for all Node.js APIs

### Anti-Patterns

❌ **WRONG:** Destructured import
```typescript
import { readFileSync } from 'fs';
const content = readFileSync('file.txt');
```

✅ **CORRECT:** Object namespace
```typescript
import * as fs from 'fs';
const content = fs.readFileSync('file.txt');
```

---

## Principle 22: Collection<T> for Arrays

> Use Collection<T> interface instead of raw arrays `T[]`.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-22-collectiont-for-arrays)

### Details

Like `Reference<T>` wraps nullable single values, `Collection<T>` wraps arrays with type-safe operations:
- No raw arrays `peers: Scenario[]` → use `peers: Collection<Scenario>`
- Collection provides: `add()`, `remove()`, `find()`, `forEach()`, `map()`, `filter()`
- Elements accessed via `at(index)` return `Reference<T>`

### Why

- **Type safety:** Type-safe collection operations
- **Consistency:** Same pattern as `Reference<T>`
- **Method references:** Works with `.forEach(this.method)` instead of arrow functions

### Anti-Patterns

❌ **WRONG - raw array**
```typescript
private peers: Scenario[] = [];
const peers = this.model?.peers || [];
```

❌ **WRONG - arrow function callback**
```typescript
peers.forEach(peer => { this.peerRender(peer); });
```

✅ **CORRECT - Collection<T>**
```typescript
private peers: Collection<Scenario<ONCEModel>>;
const peers: Collection<Scenario<ONCEModel>> = this.model.peers;

// ✅ CORRECT - method reference (no arrow functions needed!)
peers.forEach(this.peerRender);  // Pass method directly
peers.forEach(this.peerRender.bind(this));  // If 'this' context needed
```

### Examples

- **PDCA:** [2025-12-03-UTC-1200.mvc-lit3-views.pdca.md](./2025-12-03-UTC-1200.mvc-lit3-views.pdca.md)

---

## Principle 23: EAMD.ucp Virtual Root (Static Asset Serving)

> All static assets served via virtual `/EAMD.ucp/` root path for absolute imports.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-23-eamducp-virtual-root-static-asset-serving)

### Details

The browser needs predictable, absolute URLs for importing JavaScript modules, CSS, and other assets. The `/EAMD.ucp/` virtual route maps to the project root filesystem:

- `/EAMD.ucp/components/...` → `{projectRoot}/components/...`
- `/EAMD.ucp/scenarios/...` → `{projectRoot}/scenarios/...`

This enables:
1. **Absolute imports in browser** - No relative path hell (`../../dist/...`)
2. **Component-agnostic paths** - Works from any HTML page
3. **Consistent with filesystem** - Same structure as disk layout
4. **Future: Physical symlink** - Eventually `EAMD.ucp` becomes a real directory

### Anti-Patterns

❌ **WRONG - Relative paths break depending on where HTML is served**
```html
<script type="module">
import { ONCE } from '../../dist/ts/layer1/ONCE.js';  // Breaks!
</script>
```

✅ **CORRECT - Absolute import via EAMD.ucp virtual root**
```html
<script type="module">
import { ONCE } from '/EAMD.ucp/components/ONCE/0.3.21.8/dist/ts/layer1/ONCE.js';
import { CSSLoader } from '/EAMD.ucp/components/ONCE/0.3.21.8/dist/ts/layer2/CSSLoader.js';
</script>
```

### Examples

- **PDCA:** [2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md](./2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md)
- **PDCA:** [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

## Principle 24: RelatedObjects Registry

> UcpController registry for discovering related infrastructure objects by interface.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-24-relatedobjects-registry)

### Details

Register component instances by interface for polymorphic discovery:
- Register component instances: `controller.relatedObjectRegister(InterfaceType, instance)`
- Auto-registers parent interfaces (OncePeerItemView → ItemView → View)
- Lookup returns all matching: `controller.relatedObjectLookup(View)` → all views

### Code Example

```typescript
// Registration
controller.relatedObjectRegister(OncePeerItemView, viewInstance);

// Lookup (polymorphic)
const views = controller.relatedObjectLookup(View);       // All views
const items = controller.relatedObjectLookup(ItemView);   // All ItemViews
```

### Why

- **Polymorphic discovery:** Find objects by interface, not concrete type
- **Flexibility:** Register any implementation of an interface
- **Hierarchy:** Auto-registration of parent interfaces

### Examples

- **PDCA:** [2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md](./2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md)

---

## Principle 25: Tootsie Tests Only

> No Vitest/Jest functional tests. Only Radical OOP Tootsie tests.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-25-tootsie-tests-only)

### Details

Tests are classes, not functions:
- Tests are classes extending `ONCETestCase` or `DefaultWeb4TestCase`
- No `describe()` / `it()` functional patterns
- Tests are scenarios (hibernatable, discoverable)

### Anti-Patterns

❌ **WRONG - Functional test**
```typescript
describe('Test05', () => {
  it('should work', () => { ... });
});
```

✅ **CORRECT - Radical OOP Test**
```typescript
class Test05 extends ONCETestCase {
  async executeTestLogic(): Promise<any> {
    // test implementation
  }
}
```

### Why

- **OOP consistency:** Tests follow same OOP patterns as production code
- **Scenarios:** Tests are hibernatable scenarios
- **Discoverability:** Tests can be discovered and executed programmatically

### Examples

- **PDCA:** [2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md](./2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md)

---

## Principle 26: No Factory Functions - Class + init() Only

> Factory functions violate Radical OOP. Always use `new Class().init(scenario)`.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-26-no-factory-functions---class--init-only)

### Details

No factory functions:
- No `createXyz()` factory functions
- All instantiation via `new Class().init(scenario)`
- Constructor handles defaults, init() handles async setup

### Anti-Patterns

❌ **WRONG - Factory function (functional programming)**
```typescript
const route = routeScenarioCreate('/', 'view-tag');
```

✅ **CORRECT - Radical OOP**
```typescript
const route = await new Route().init({
  model: { pattern: '/', viewTag: 'view-tag' }
});
```

### Why

- **OOP consistency:** Objects created via constructors, not functions
- **Flexibility:** Same class can be initialized with different scenarios
- **No factories:** Simplifies object creation patterns

### Examples

- **PDCA:** [2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md](./2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md)

---

## Principle 27: Web Components ARE Radical OOP

> HTML declarative syntax IS object instantiation. No impedance mismatch.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-27-web-components-are-radical-oop)

### Details

Web Components map directly to OOP concepts:

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

### Architecture

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

**Key Insight:**
- Web4 API: `add()` / `remove()` - what consumers use
- Implementation: Adapts to underlying framework
- Benefit: Same Web4 code works with any UI framework

### Examples

- **PDCA:** [2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md](./2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md)

---

## Principle 28: JsInterface Pattern - Object IS Its Type

> In JavaScript/TypeScript, the object IS its type. No redundant enums or type discriminators needed.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md#principle-28-jsinterface-pattern---object-is-its-type)

### Details

The class hierarchy IS the type system. Use `constructor.name` and `instanceof` instead of type fields or enums.

#### No Type Enums

- **No redundant type enums** - class hierarchy IS the type
- **No `type` discriminator fields** - use `instanceof` or `constructor.name`
- **Serialize `className`** when sending objects over HTTP

### Anti-Patterns

❌ **WRONG: Redundant enum duplicates class type information**
```typescript
enum RouteType { SPA, STATIC, IOR, HTML, SCENARIO }

interface RouteModel {
  type: RouteType;  // Redundant! The class already tells us the type!
}

if (route.type === RouteType.STATIC) { ... }  // Double maintenance!
```

✅ **CORRECT: Class hierarchy IS the type system**
```typescript
route.constructor.name           // "StaticFileRoute"
route instanceof StaticFileRoute // true

// Type check without enum:
if (route instanceof StaticFileRoute) { ... }
```

#### Serialize className for HTTP

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

#### Runtime Type Access

```typescript
// Get type name
const typeName = object.constructor.name;

// Type check
if (object instanceof SpecificClass) { ... }

// Get all implemented interfaces (future: via TypeRegistry)
const interfaces = TypeRegistry.interfacesOf(object);
```

#### Why JsInterface?

| Approach | Problem |
|----------|---------|
| Enums | Duplicate information, manual sync, no polymorphism |
| Type fields | Same issues, plus storage overhead |
| **JsInterface** | Single source of truth (the class), enables polymorphism |

### Examples

- **PDCA:** [2025-12-12-UTC-1103.http-routes-display.pdca.md](./2025-12-12-UTC-1103.http-routes-display.pdca.md)
- **PDCA:** [2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md](./2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md)

---

## Principle 29: IDProvider Pattern

> ID generation via RelatedObjects lookup, NOT direct `crypto.randomUUID()` calls.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md)

### Details

UcpComponent provides ID generation as a fundamental capability:
- **UUIDProvider** - Random RFC 4122 v4 UUIDs via `this.uuidCreate()`
- **ContentIDProvider** - Content-based hashing via `this.contentIdCreate(content)`
- Providers registered in RelatedObjects for polymorphic lookup
- Override `idProvidersRegister()` to use custom providers

### Why

- **Testability:** Mock providers in tests for deterministic IDs
- **Flexibility:** Swap UUID → ULID → custom without code changes
- **Radical OOP:** ID generation is an object responsibility, not a function call
- **DRY:** Single implementation shared across all components

### Anti-Patterns

❌ **WRONG:** Direct crypto API call
```typescript
modelDefault(): FileModel {
  return { uuid: crypto.randomUUID() };
}
```

✅ **CORRECT:** Via UcpComponent method
```typescript
modelDefault(): FileModel {
  return { uuid: this.uuidCreate() };
}

// For content hashing:
const hash = await this.contentIdCreate(fileContent);
```

### Architecture

```
UcpComponent (base)
├── static uuidProviderInstance: UUIDProvider (singleton)
├── static sha256ProviderInstance: SHA256Provider (singleton)
├── idProvidersRegister() → registers in RelatedObjects
├── uuidCreate() → looks up IDProvider
├── contentIdCreate(content) → looks up ContentIDProvider
└── contentIdCreateSync(content) → sync version
```

### Examples

- **Code:** [UcpComponent.ts](../../../../ONCE/0.3.22.1/src/ts/layer2/UcpComponent.ts)
- **Code:** [SHA256Provider.ts](../../../../ONCE/0.3.22.1/src/ts/layer2/SHA256Provider.ts)
- **Code:** [ContentIDProvider.interface.ts](../../../../ONCE/0.3.22.1/src/ts/layer3/ContentIDProvider.interface.ts)

---

## Principle 30: Tree & Container Pattern

> Hierarchical data uses `Tree<T>` interface. Navigable hierarchies use `Container<T>`.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md)

### Details

For any hierarchical/tree-structured data:
- **Tree<T>** - Base interface with `parent`, `children`, `childAdd()`, `childRemove()`
- **Container<T>** - Extends Tree for navigable OverViews with `pathFromRoot()`, `navigateTo()`
- Parent is `Reference<Tree<T>>` (null for root)
- Children is `Collection<T>` (Web4 Principle 22)

### Why

- **Reusability:** Breadcrumbs, OverViews work on any Tree implementation
- **Consistency:** Same navigation pattern for folders, menus, org charts
- **Polymorphism:** Components work with Tree interface, not concrete types
- **Mobile UX:** Container enables animated panel transitions

### Anti-Patterns

❌ **WRONG:** Custom hierarchy without interfaces
```typescript
class Folder {
  parentFolder: Folder;
  childFolders: Folder[];
}
```

✅ **CORRECT:** Implement Tree interface
```typescript
class DefaultFolder implements Tree<FileSystemNode>, Container<FileSystemNode> {
  get parent(): Reference<Tree<FileSystemNode>> { ... }
  get children(): Collection<FileSystemNode> { ... }
  childAdd(child: FileSystemNode): void { ... }
  pathFromRoot(): Container<FileSystemNode>[] { ... }
}
```

### Architecture

```
Tree<T> Interface
├── parent: Reference<Tree<T>>
├── children: Collection<T>
├── childAdd(child: T): void
├── childRemove(child: T): boolean
├── hasChildren: boolean
└── childCount: number

Container<T> extends Tree<T>
├── displayName: string
├── uuid: string
├── pathFromRoot(): Container<T>[]  ← For breadcrumb
└── navigateTo(child: T): boolean   ← For animated panels
```

### Examples

- **Code:** [Tree.interface.ts](../../../../ONCE/0.3.22.1/src/ts/layer3/Tree.interface.ts)
- **Code:** [Container.interface.ts](../../../../ONCE/0.3.22.1/src/ts/layer3/Container.interface.ts)
- **Code:** [DefaultFolder.ts](../../../../ONCE/0.3.22.1/src/ts/layer2/DefaultFolder.ts)

---

## Principle 31: Universal Drop Support

> ALL UcpViews accept file drops by default. Use `dropDisabled="true"` to opt out.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md)

### Details

Every view in Web4 is a drop target:
- **Default enabled:** All views handle `dragover` and `drop` events
- **Opt-out:** Set `dropDisabled="true"` attribute to disable
- **Processing:** Drop triggers `view.add(file)` which creates components via FileSystem
- **No DropZoneView:** No special drop zone component needed

### Why

- **User Experience:** Drag files anywhere, not just designated zones
- **Simplicity:** Drop handling centralized in UcpView base
- **Consistency:** Same drop behavior across entire application
- **Intuitive:** Every view accepts content by default

### Anti-Patterns

❌ **WRONG:** Special drop zone component
```typescript
<folder-view>
  <drop-zone-view onDrop="${this.handleDrop}"></drop-zone-view>
</folder-view>
```

✅ **CORRECT:** Views accept drops natively
```typescript
// UcpView base class handles drops
<folder-view>  <!-- Accepts drops by default -->
</folder-view>

// Disable if needed
<read-only-view dropDisabled="true"></read-only-view>
```

### Drop Flow

```
User drops file → UcpView.handleDrop()
                      ↓
              view.add(file)
                      ↓
         FileSystem.componentFromFile()
                      ↓
        MimetypeRegistry.handlerLookup()
                      ↓
         Component created + initialized
                      ↓
         view.appendChild(component.view)
```

### Examples

- **PDCA:** [2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md](../../../../ONCE/0.3.22.1/session/2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md)

---

## Principle 32: Enums Over String Literals

> NO string literal type unions. Always use enums for type safety and maintainability.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md)

### Details

String literal types (`'value1' | 'value2'`) are forbidden. Use enums instead:
- Enums provide type safety and autocomplete
- Enums are maintainable - change in one place
- Enums follow P19: One File One Type
- Enums enable polymorphism and extension

### Why

- **Type safety:** Compiler catches typos and invalid values
- **Maintainability:** Change enum value in one place
- **Discoverability:** IDE autocomplete shows all valid values
- **Consistency:** Aligns with P19 (One File One Type)
- **Refactoring:** Easier to rename or restructure values

### Anti-Patterns

❌ **WRONG:** String literal type union
```typescript
interface Action {
  style: 'primary' | 'secondary' | 'danger';  // BAD!
}

function getStyle(style: 'primary' | 'secondary'): string {  // BAD!
  return style;
}
```

✅ **CORRECT:** Enum in separate file
```typescript
// ActionStyle.enum.ts (P19: One file one type)
export enum ActionStyle {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  WARNING = 'warning'
}

// Action.interface.ts
import { ActionStyle } from './ActionStyle.enum.js';
interface Action {
  style: ActionStyle;  // Type-safe enum
}
```

### Examples

- **PDCA:** [2025-12-03-UTC-1200.mvc-lit3-views.pdca.md](./2025-12-03-UTC-1200.mvc-lit3-views.pdca.md)
- **Code:** ActionStyle.enum.ts, ViewTab.enum.ts (mentioned in PDCA)

---

## Principle 33: Separation of Concerns

> NO inline CSS or HTML templates. External files only. Violates P19 (One File One Type) and Separation of Concerns.

**Checklist:** [web4-principles-checklist.md](./web4-principles-checklist.md)

### Details

Views must separate concerns into external files:
- **NO inline CSS** in TypeScript files - use external `.css` files
- **NO inline HTML templates** in TypeScript files - use external `.html` files
- Each file type in its own file (P19: One File One Type)
- TypeScript files contain only logic

### Exception: Lit HTML Binding

**ONLY exception:** Lit framework requires inline `html` template literals in `render()` methods due to framework limitations. This is the ONLY acceptable inline template.

- **CSS:** MUST be external - no exception
- **HTML in Lit:** Inline `html` template literal in `render()` is accepted (framework limitation)
- **Future:** Vanilla views will have full separation with external HTML files

### Why

- **Maintainability:** CSS/HTML can be edited without touching TypeScript
- **Reusability:** Styles/templates can be shared across views
- **Tooling:** CSS/HTML editors work better with separate files
- **P19 Compliance:** Each file contains one type (TS/CSS/HTML)
- **Organization:** Clear separation of structure (HTML), style (CSS), behavior (TS)

### Anti-Patterns

❌ **WRONG:** Inline CSS in TypeScript
```typescript
class ItemView extends LitElement {
  static styles = css`
    .item { color: red; }
  `;  // BAD - inline CSS! MUST be external file!
}
```

✅ **CORRECT:** External CSS (required)
```typescript
// ItemView.ts
import { ItemViewCSS } from './css/ItemView.css.js';

class ItemView extends AbstractWebBean {
  static styles = [ItemViewCSS];  // External CSS file
}

// css/ItemView.css (CSS only)
.item { color: red; }
```

✅ **ACCEPTED (Lit limitation):** Inline HTML template in `render()`
```typescript
// Lit requires inline html template literals
render() {
  return html`
    <div class="item">${this.model.name}</div>
  `;  // Accepted - Lit framework limitation
}
```

❌ **WRONG (for non-Lit):** Inline HTML template when external is possible
```typescript
// Vanilla views should use external HTML files
render() {
  return ItemViewHTML(this.model);  // External template
}
```

### Examples

- **PDCA:** [2025-12-03-UTC-1200.mvc-lit3-views.pdca.md](./2025-12-03-UTC-1200.mvc-lit3-views.pdca.md)
- **PDCA:** [2025-12-03-UTC-1400.lit-css-preload.pdca.md](./2025-12-03-UTC-1400.lit-css-preload.pdca.md)

---

## How to Use This Document

1. **Reference from checklist:** Use links in [web4-principles-checklist.md](./web4-principles-checklist.md) to jump to details
2. **When implementing:** Read principle details before coding
3. **When reviewing:** Check details to verify compliance
4. **When updating:** Add examples and improve explanations

---

**"Never 2 1 (TO ONE). Always 4 2 (FOR TWO)."** 🤝✨















