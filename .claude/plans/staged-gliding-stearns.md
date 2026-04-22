# Plan: Web4 Component Anatomy & Lego Brick De-monolithization

## Context

ONCE 0.3.22.2 is a monolith of 244 files. These are NOT random — they form **natural component clusters** (lego bricks). Every UcpComponent-based class is a potential standalone Web4 component. The goal: disentangle ONCE into reusable components with proper `file:` npm dependencies, all at unified version 0.3.23.0.

## Component Anatomy

Every Web4 component follows the same pattern:

```
components/{Name}/{Version}/
├── {name}                    # CLI shell script (./component = npm start = build + usage)
├── package.json              # @web4x/{name}, file: dependencies to other components
├── tsconfig.json             # Compiles src/ts → dist/ts
├── source.env                # PATH, completion registration
├── src/
│   ├── sh/build.sh           # Cascading build: deps first, then self
│   └── ts/
│       ├── layer1/           # Infrastructure (kernel, singletons)
│       ├── layer2/           # Implementation (Default* classes)
│       ├── layer3/           # Interfaces (*.interface.ts, JsInterface)
│       ├── layer4/           # Orchestration (async, IOR, loaders)
│       └── layer5/           # UX (CLI, views)
├── dist/ts/                  # Compiled output (mirrors src/ts)
├── test/                     # Tootsie tests
└── templates/                # Component generation templates (Web4TSComponent only)
```

**Key rules:**
- `./component` (no args) = `npm start` = builds all deps + shows usage
- Each component is `@web4x/{name}` as npm package
- Dependencies via `"file:../../{OtherComponent}/{version}"` in package.json
- Components build bottom-up: no-dep components first, then dependents

## Natural Component Groupings (Lego Bricks)

From dependency analysis of ONCE's 244 files:

### Layer 0: Foundation (no Web4 deps — only Node.js builtins)

| Component | Files | Purpose | Deps |
|-----------|-------|---------|------|
| **@web4x/ucp** | UcpComponent, UcpController, TypeRegistry, UcpModel, JsInterface, Model, Scenario, Reference, Collection + all fundamental interfaces | Universal Component Pattern — the base class everything extends | Node.js only |

### Layer 1: Core Services (depend on @web4x/ucp)

| Component | Files | Purpose | Deps |
|-----------|-------|---------|------|
| **@web4x/unit** | DefaultUnit, UnitDiscoveryService, UnitCacheManager + interfaces | Atomic file tracking, copy detection, sync | @web4x/ucp |
| **@web4x/persistence** | UcpStorage, ScenarioService, ScenarioManager, BrowserScenarioStorage + interfaces | Scenario I/O, hibernation, storage | @web4x/ucp |
| **@web4x/user** | DefaultUser, UUIDProvider, SHA256Provider + interfaces | Identity, ID generation, content hashing | @web4x/ucp |

### Layer 2: Infrastructure (depend on Layer 1)

| Component | Files | Purpose | Deps |
|-----------|-------|---------|------|
| **@web4x/web4tscomponent** | DefaultWeb4TSComponent, DefaultCLI, DelegationProxy, SemanticVersion, TsAstExtractor, TSCompletion, DefaultColors, HierarchicalCompletionFilter, TestFileParser + CLI interfaces | Component lifecycle: create, build, test, upgrade, links | @web4x/ucp, @web4x/unit, @web4x/persistence |
| **@web4x/filesystem** | DefaultFile, DefaultFolder, DefaultFileSystem, DefaultImage, DefaultMimetypeHandlerRegistry + interfaces | OOP file operations with ISR lazy loading | @web4x/ucp |
| **@web4x/http** | HTTPServer, HTTPSServer, HTTPRouter, Route + all route subclasses (HTML, IOR, Static, Scenario, ServiceWorker, Manifest, Units, Error), PortManager + interfaces | HTTP/HTTPS server stack | @web4x/ucp |

### Layer 3: Platform (depend on Layer 2)

| Component | Files | Purpose | Deps |
|-----------|-------|---------|------|
| **@web4x/tls** | TLSCertificateLoader, ServerNameIndicationManager, DomainCertificateStore, LetsEncryptCertificateProvider, CertificateRenewalScheduler + interfaces | TLS/SSL certificate management | @web4x/http |
| **@web4x/once** | NodeJsOnce, BrowserOnce, DefaultOnceKernel, ServerHierarchyManager, OnceServiceWorker, CSSLoader, HTMLTemplateLoader, DefaultWebSocket + views + ONCECLI | Kernel, multi-server orchestration, PWA | ALL above |

### Layer 4: Application (depend on ONCE or Web4TSComponent)

| Component | Files | Purpose | Deps |
|-----------|-------|---------|------|
| **@web4x/web4test** | DefaultWeb4TestCase + interfaces | Test framework base | @web4x/ucp |
| **@web4x/tootsie** | TootsieTestRunner + test infrastructure | OOP test runner | @web4x/web4test |
| **@web4x/pdca** | DefaultPDCA, DefaultTrainingModule + interfaces | PDCA cycle, trainAI, dual links | @web4x/web4tscomponent |
| **@web4x/idealminimalcomponent** | Reference "hello world" component | Template output example | @web4x/web4tscomponent (via DelegationProxy) |

### Layer 5: Game (depend on ONCE)

| Component | Files | Purpose | Deps |
|-----------|-------|---------|------|
| **UpDown.Cards/Core/Demo/etc.** | Game components | UpDown card game | @web4x/once |

## Dependency Graph

```
@web4x/ucp (FOUNDATION — no deps)
├── @web4x/unit
├── @web4x/persistence
├── @web4x/user
├── @web4x/filesystem
├── @web4x/http
│   └── @web4x/tls
├── @web4x/web4tscomponent (depends on: ucp, unit, persistence)
│   ├── @web4x/pdca
│   └── @web4x/idealminimalcomponent
├── @web4x/web4test
│   └── @web4x/tootsie
└── @web4x/once (depends on ALL above — the runtime kernel)
    └── UpDown.* (game components)
```

## Build Order (cascading, bottom-up)

```
1. @web4x/ucp          (no deps — builds first)
2. @web4x/unit          (depends on ucp)
   @web4x/persistence   (depends on ucp)
   @web4x/user          (depends on ucp)
   @web4x/filesystem    (depends on ucp)
   @web4x/http          (depends on ucp)
3. @web4x/tls           (depends on http)
   @web4x/web4tscomponent (depends on ucp, unit, persistence)
   @web4x/web4test      (depends on ucp)
4. @web4x/tootsie       (depends on web4test)
   @web4x/pdca          (depends on web4tscomponent)
5. @web4x/once          (depends on ALL)
6. UpDown.*             (depends on once)
```

Each `./component` (no args) triggers its dependency builds automatically via build.sh.

## Phase Status Overview

| Phase | Name | Status | Verified |
|-------|------|--------|----------|
| **0** | @web4x/ucp extraction | **DONE** | Compiles clean, 0 errors, `ucp info` works |
| **1** | @web4x/web4tscomponent wiring | **DONE** | Compiles clean, 0 errors, `file:` dep to UCP works |
| **1.25** | Fix BUG-W02 — CLI path delegation | **DONE** | `info` shows 0.3.23.0, Component Root correct |
| **1.5** | Cascading auto-build | **DONE** | Cold start verified: both dist/ deleted, `web4tscomponent info` auto-builds UCP then self |
| **2** | @web4x/unit extraction | **DONE** | 3 L2 files + 2 L3 local + 9 L3 re-exports, compiles clean, cascading build works |
| **3a** | @web4x/persistence | **DONE** | UcpStorage + BrowserScenarioStorage, 0 errors |
| **3b** | @web4x/user | **DONE** | DefaultUser + NodeOSInfrastructure, 0 errors |
| **3c** | @web4x/filesystem | **DONE** | 5 L2 + 13 L3 + PlatformDetection, 0 errors |
| **3d** | @web4x/http | **DONE** | HTTPServer + Router + 7 Routes + IORMethodRouter, 0 errors |
| **3e** | @web4x/tls | **DONE** | TLS/cert/SNI/LetsEncrypt/CertOrchestrator, 0 errors |
| **4** | @web4x/once 0.3.23.0 | **DONE** | 244 files, experimentalDecorators, 0 errors |
| **5** | Framework components | **DONE** | web4test, tootsie, pdca, idealminimal — all 0 errors |
| **6** | Testing & promotion | **IN PROGRESS** | T1-T8 test plan sent to tester |

### Open Bugs

| Bug | Status | Description |
|-----|--------|-------------|
| BUG-W01 | **FIXED** | ISR (IOR Self-Replacement) missing from UcpModel — restored |
| BUG-W02 | **FIXED** | CLI path delegation — added import.meta.url self-discovery to init() |
| BUG-W03 | **FIXED** | IOR simplified to stub — restored full pluggable loader registry |

### Tester Status

- 12 test specs (T1-T12) written in `session/tasks/test-phase1-phase1.5-regression.md`
- Sent to tester at upDownTeam:0.3
- Tests NOT yet created as actual files — tester working on it

---

## Revised Migration Phases

### Phase 0: Create @web4x/ucp 0.3.23.0 (FOUNDATION) — DONE

Extracted 63 files (5 L2, 55 L3, 2 L4, 1 L5) from ONCE 0.3.22.2 into `/var/dev/UpDown/components/UCP/0.3.23.0/`.

**What it contains:**
- L2: UcpComponent, UcpController, TypeRegistry, UUIDProvider, SHA256Provider
- L3: 55 files — JsInterface, Component, UcpModel (with ISR), TypeDescriptor, Model, Scenario, Reference, View, Controller, LifecycleState, IOR interfaces, Loader interfaces, all fundamental interfaces/enums
- L4: IOR (full, pluggable loader registry), FileLoader (built-in)
- L5: UcpCLI (info/exports/version)

**Zero deps.** Builds standalone. `ucp info` works correctly.

### Phase 1: Create @web4x/web4tscomponent 0.3.23.0 — DONE

Wired to UCP via `"@web4x/ucp": "file:../../UCP/0.3.23.0"` in package.json. 0 TS errors.

**What was done:**
- 25 layer3 re-export files pointing to @web4x/ucp
- UcpComponent imported from `@web4x/ucp/dist/ts/layer2/UcpComponent.js`
- IOR re-exported from `@web4x/ucp/dist/ts/layer4/IOR.js`
- 5 files temporarily copied from ONCE: UnitDiscoveryService, ScenarioService, UcpStorage, TsAstExtractor, DefaultUnit (will extract to @web4x/unit and @web4x/persistence in Phase 2-3)
- DefaultWeb4TSComponent: local `cliInstance`/`cli`/`targetDirectory`, removed `override` from path getters

### Phase 1.25: Fix BUG-W02 — CLI path delegation — NEXT

Both 0.3.22.4 and 0.3.23.0 show version `0.0.0.0` and Component Root `N/A` in `web4tscomponent info`. The `on Component Version links` chaining hits infinite recursion (Maximum call stack size exceeded). Root cause: when UcpComponent was extracted to @web4x/ucp, the CLI path getters (`projectRoot`, `componentRoot`, `version`) were removed from the base class. DefaultWeb4TSComponent patched `projectRoot` locally but the CLI model never gets `version` or `componentRoot` populated.

**Observed in web4-test-shell (upDownTeam:0.2):**
- `web4tscomponent info` (0.3.22.4 via latest) → Version: 0.0.0.0, Component Root: N/A
- `web4tscomponent info` (0.3.23.0 direct) → Version: 0.0.0.0, Component Root: N/A
- `web4tscomponent info` (0.3.20.6 via dev) → Version: 0.3.20.6, Component Root: correct — **working reference**
- `web4tscomponent on Web4TSComponent 0.3.23.0 links` → Maximum call stack size exceeded

**Fix approach:**
1. Trace how 0.3.20.6 populates `version` and `componentRoot` in the CLI model (the working reference)
2. Implement equivalent path population in 0.3.23.0's DefaultCLI.init() or DefaultWeb4TSComponent
3. Either restore path getters on UcpComponent via a CLIProvider interface, or have DefaultCLI.init() extract version from directory name and set componentRoot from resolved path
4. Validate: `web4tscomponent info` shows correct version and paths, `on ... links` chaining works

**Why here:** Without working `info` and `on` chaining, the component is not functionally equivalent to 0.3.20.6. Tron's rule: DRY optimization only, NEVER lose functionality. This must be fixed before cascading build, because cascading build validation also uses the CLI.

### Phase 1.5: Cascading auto-build infrastructure — NOT STARTED

Implement the self-building constraint for real. Every component's `build.sh` and CLI wrapper must auto-build all `file:` dependencies before compiling itself. Without this, no component works from a cold start.

**Deliverable:** `rm -rf UCP/0.3.23.0/dist && ./web4tscomponent` auto-detects missing UCP dist, builds UCP first, then builds itself. Zero manual steps.

**Implementation:**
1. Update `build.sh` template: parse `package.json` for `"file:"` deps, check each dep's `dist/` exists, call dep's `build.sh` if missing
2. Retrofit @web4x/ucp build.sh (leaf node — no deps, already works)
3. Retrofit @web4x/web4tscomponent build.sh (must auto-build @web4x/ucp)
4. Validate: `rm -rf UCP/0.3.23.0/dist Web4TSComponent/0.3.23.0/dist && ./web4tscomponent` succeeds
5. This becomes the template for ALL future components — every Phase 2+ component gets cascading build from creation

**Why here:** Phase 0+1 created the first real dependency chain (ucp → web4tscomponent). Phase 2+ creates more. If cascading build isn't proven on the simplest chain first, every subsequent phase ships broken components.

### Phase 2: Create @web4x/unit 0.3.23.0 — DONE

Extracted to `/var/dev/UpDown/components/Unit/0.3.23.0/`.

**What it contains:**
- L2: DefaultUnit, UnitDiscoveryService, ScenarioService (moved from W4TSC)
- L3: UnitDefinition.interface, ComponentManifest.interface (local definitions)
- L3: 9 re-export files from @web4x/ucp (UnitModel, UnitReference, SyncStatus, TypeM3, Scenario, Reference, Model, ScenarioUnit, PersistenceManager)
- Depends on `@web4x/ucp` via `file:` dep

**What changed in W4TSC:**
- Added `"@web4x/unit": "file:../../Unit/0.3.23.0"` to package.json
- DefaultWeb4TSComponent imports DefaultUnit, UnitDiscoveryService, ScenarioService from @web4x/unit
- UnitDefinition.interface.ts and ComponentManifest.interface.ts converted to re-exports from @web4x/unit
- Removed local copies of DefaultUnit.ts, UnitDiscoveryService.ts, ScenarioService.ts

**Cascading build verified:** UCP → Unit → Web4TSComponent (all 3 from cold start)

### Phase 3: Create other Layer 1-2 components — NOT STARTED

@web4x/persistence (UcpStorage, ScenarioService), @web4x/user (DefaultUser, UUIDProvider, SHA256Provider), @web4x/filesystem, @web4x/http, @web4x/tls — all from ONCE.

### Phase 4: Create @web4x/once 0.3.23.0 — NOT STARTED

What remains after extraction: NodeJsOnce, BrowserOnce, ServerHierarchyManager, views, ONCECLI. Depends on ALL above via `file:` references.

### Phase 5: Create remaining framework components 0.3.23.0 — NOT STARTED

@web4x/web4test, @web4x/tootsie, @web4x/pdca, @web4x/idealminimalcomponent.

### Phase 6: Testing, Unit tracking, promotion — NOT STARTED

PDCA with tester. releaseTest on all components. Unit origin IOR tracking.

## Current Semantic Links (Web4TSComponent)

```
prod   → 0.3.19.1  ✅
test   → 0.3.19.3  ✅
dev    → 0.3.20.6  ✅  ← working reference (info/links/on all work)
latest → 0.3.22.4  ✅  ← broken info (0.0.0.0), same bug as 0.3.23.0
```

0.3.23.0 is not linked yet — will be linked after Phase 1.25 + 1.5 validation.

## Version Strategy

ALL components at 0.3.23.0 (prod) → 0.3.23.1 (dev) → iterations → releaseTest → 0.3.24.0

## Self-Building Constraint

`./component` (no args) = `npm start` = builds deps + compiles + shows usage.

```
build.sh pattern:
  for each file: dep in package.json:
    if dep dist/ missing → cd dep && ./src/sh/build.sh
  npm install
  npx tsc
```

## PDCA with Tester

Per phase: Expert implements → sends test instructions to tester (upDownTeam:0.3) → tester tests in test-shell (upDownTeam:0.2) → reports PASS/FAIL → expert fixes → tester re-tests → next phase.

Unexpected behavior → STOP → document BUG-W## → root cause → fix or defer → tester verifies.

## First Step

**Phase 0** is the critical foundation. @web4x/ucp must be extracted first because ALL other components depend on UcpComponent. This is the biggest extraction (~50+ interface files from layer3) but has zero external dependencies, making it safe to do first.

The question: which layer3 interfaces belong to @web4x/ucp (fundamental) vs specific components (filesystem, http, etc.)? The boundary: if UcpComponent.ts or UcpController.ts imports it, it belongs to @web4x/ucp.
