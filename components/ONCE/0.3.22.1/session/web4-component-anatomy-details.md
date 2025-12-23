# Web4 Component Anatomy Details

**Checklist:** [§/session/web4-component-anatomy-checklist.md](./web4-component-anatomy-checklist.md)

---

## UCP Architecture: Unit - Component - Package

```
┌─────────────────────────────────────────────────────────────┐
│  PACKAGE = Group of Components                               │
│  └── /components/                                            │
├─────────────────────────────────────────────────────────────┤
│  COMPONENT = Versioned Folder (4 criteria)                   │
│  └── /components/{Name}/{Version}/                           │
│       ├── {Name}.component.json  ← Machine-readable descriptor│
│       ├── package.json           ← Node.js metadata (is Unit)│
│       ├── tsconfig.json          ← TypeScript config (is Unit)│
│       ├── src/ts/layer*/         ← Code (each file is Unit)  │
│       ├── src/sh/                ← Lifecycle scripts (Units) │
│       └── test/tootsie/          ← Tests (Units)             │
├─────────────────────────────────────────────────────────────┤
│  UNIT = Atomic Terminal File                                 │
│  └── {file}.unit → scenarios/index/{uuid}.scenario.json     │
│       ├── IOR: uuid, component: "Unit", version              │
│       ├── origin: git IOR to canonical source                │
│       └── symlinkPaths: all locations referencing this unit  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Descriptor: `{Name}.component.json`

The descriptor IS a `Scenario<Web4TSComponentModel>` with its own `unit` as a full `Scenario<UnitModel>`:

```json
{
  "ior": {
    "uuid": "a1b2c3d4-...",
    "component": "Web4TSComponent",
    "version": "0.3.20.6"
  },
  "owner": "system",
  "model": {
    "uuid": "a1b2c3d4-...",
    "name": "ONCE",
    "version": "0.3.22.1",
    "description": "Open Network Compute Environment - Web4 Kernel",
    "layer2Implementation": "NodeJsOnce",
    "entryPoints": {
      "cli": "src/ts/layer5/ONCECLI.ts",
      "node": "dist/ts/layer2/NodeJsOnce.js",
      "browser": "dist/ts/layer2/BrowserOnce.js"
    },
    "units": [
      "/EAMD.ucp/components/ONCE/0.3.22.1/src/ts/layer5/views/css/FileItemView.css",
      "/EAMD.ucp/components/ONCE/0.3.22.1/src/ts/layer5/views/css/ActionBar.css",
      "/EAMD.ucp/components/ONCE/0.3.22.1/package.json",
      "/EAMD.ucp/components/ONCE/0.3.22.1/tsconfig.json"
    ],
    "dependencies": {
      "lit": "^3.2.0",
      "typescript": "^5.0.0"
    }
  },
  "unit": {
    "ior": { "uuid": "e5f6g7h8-...", "component": "Unit", "version": "0.3.22.1" },
    "owner": "system",
    "model": {
      "uuid": "e5f6g7h8-...",
      "name": "ONCE.component.json",
      "origin": "ior:git:github.com/.../ONCE.component.json",
      "filePath": "ONCE.component.json",
      "mimetype": "application/json",
      "symlinkPaths": ["components/ONCE/0.3.22.1/ONCE.component.json.unit"]
    }
  }
}
```

### Key Points

- **`units`**: `Collection<IOR>` — ALL units as IOR path strings, NO categories
- **IOR paths**: Always `/EAMD.ucp/components/{Name}/{Version}/{path}`
- **`unit`**: Full `Scenario<UnitModel>` — the descriptor is itself a unit
- **Server translation**: `/EAMD.ucp/...` → physical file path on server

---

## Unit Scenario Structure

Each file in a component has a `.unit` symlink pointing to its scenario:

```
src/ts/layer5/views/css/FileItemView.css.unit
  → ../../../../../scenarios/index/f/c/2/d/b/fc2db7d0-c205-4472-ae4d-3c301ce95090.scenario.json
```

The scenario contains:

```json
{
  "ior": {
    "uuid": "fc2db7d0-c205-4472-ae4d-3c301ce95090",
    "component": "Unit",
    "version": "0.3.22.1"
  },
  "owner": "system",
  "model": {
    "uuid": "fc2db7d0-c205-4472-ae4d-3c301ce95090",
    "name": "FileItemView.css",
    "typeM3": "ATTRIBUTE",
    "origin": "ior:git:github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer5/views/css/FileItemView.css",
    "definition": "CSS stylesheet for FileItemView",
    "filePath": "src/ts/layer5/views/css/FileItemView.css",
    "mimetype": "text/css",
    "createdAt": "2025-12-08T15:40:33.191Z",
    "updatedAt": "2025-12-08T15:40:33.192Z",
    "indexPath": "scenarios/index/f/c/2/.../fc2db7d0-....scenario.json",
    "symlinkPaths": [
      "type/Unit/0.3.22.1",
      "components/ONCE/0.3.22.1/src/ts/layer5/views/css/FileItemView.css.unit"
    ]
  },
  "unit": {
    "indexPath": "f/c/2/d/b/fc2db7d0-....scenario.json",
    "symlinkPaths": [ ... ],
    "references": [],
    "schemaVersion": "1.1.0",
    "createdBy": "Unit/0.3.22.1",
    "createdAt": "2025-12-08T15:40:33.191Z"
  }
}
```

---

## Generator Flow

Units are NOT manually created. `DefaultWeb4TSComponent` handles all:

```
1. Developer creates file
   └── src/ts/layer5/views/css/NewView.css

2. DefaultWeb4TSComponent.unitsDiscover()
   └── Finds ALL files in component

3. DefaultWeb4TSComponent.unitCreate()
   └── Creates Scenario<UnitModel> with UUIDv4, origin IOR, filePath

4. DefaultWeb4TSComponent.unitSave()
   └── Saves to scenarios/index/{uuid-path}/
   └── Creates {file}.unit symlink

5. DefaultWeb4TSComponent.descriptorUpdate()
   └── Writes {Name}.component.json
   └── model.units = ["/EAMD.ucp/...path...", ...] (IOR paths)

Triggered by: `./once build` or `Test14_CSSUnitCreation`
```

**Key**: `UnitDiscoveryService` → moved INTO `DefaultWeb4TSComponent` (no standalone service)

---

## CSS Preloader Integration

The CSS preloader reads the component descriptor and filters for CSS units:

```typescript
// In BrowserOnceOrchestrator.assetsPreload()
const componentJson = await new IOR().init('/EAMD.ucp/components/ONCE/0.3.22.1/ONCE.component.json').load();
const allUnits: string[] = componentJson.model.units;

// Filter CSS files by extension
const cssUnits = allUnits.filter(path => path.endsWith('.css'));

for (const cssPath of cssUnits) {
  // Load each CSS via IOR (path is already /EAMD.ucp/...)
  await new IOR().init(cssPath).load();
}
```

**Key**: No category separation — filter by file extension at runtime

---

## Why Units Matter

1. **Deduplication**: Same content = same unit UUID (content-addressable)
2. **Traceability**: Origin IOR tracks where file came from
3. **Caching**: Service Worker caches by unit UUID
4. **Discovery**: Component knows all its files via descriptor
5. **Lifecycle**: Scripts handle download → uninstall cycle

---

## Current State Analysis (2025-12-21)

### ONCE's Inline `DefaultWeb4TSComponent.ts` — 9 methods

| Method | Purpose | Notes |
|--------|---------|-------|
| `init()` | Initialize component with scenario | ✅ |
| `test()` | Run tootsie tests | ✅ (calls `npx tsx test/tootsie/...`) |
| `build()` | Compile TypeScript | ✅ |
| `clean()` | Remove build artifacts | ✅ |
| `tree()` | Show component tree | ✅ |
| `links()` | Manage symlinks | ✅ |
| `unitsDiscover()` | Find and create units | ✅ |
| `manifestUpdate()` | Write asset-manifest | ⚠️ To be replaced by `descriptorUpdate()` |
| `cliWrapperGenerate()` | Create CLI wrapper script | ✅ |

### Methods to Migrate for Component Descriptor

| Method | Source | Purpose |
|--------|--------|---------|
| `toScenario()` | UcpComponent.ts (line 518) | ✅ Inherited — converts component to `Scenario<Web4TSComponentModel>` |
| `componentDescriptorUpdate()` | External Web4TSComponent | Writes `{Name}.component.json` with proper `{ ior, owner, model, unit }` structure |
| `componentDescriptorRead()` | External Web4TSComponent | Reads descriptor from disk |
| `componentStart()` | External Web4TSComponent | Build + ensure component ready |
| `start()` | External Web4TSComponent | Static entry point for component lifecycle |

### `toScenario()` vs `componentDescriptorUpdate()`

- **`toScenario()`**: Creates in-memory `Scenario<Web4TSComponentModel>` — EXISTS in UcpComponent
- **`componentDescriptorUpdate()`**: Writes `{Name}.component.json` to disk with:
  - `{ ior, owner, model, unit }` structure
  - `model.units: Collection<IOR>` — flat array of `/EAMD.ucp/...` paths
  - `unit: Scenario<UnitModel>` — the descriptor's OWN unit

### Key Decision: `componentStart()` Location

**Option A**: Keep in Web4TSComponent (delegated)
- NodeJsOnce continues to delegate via `web4ts.componentStart()`
- Clean separation between "ONCE kernel" and "component management"

**Option B**: Move to ONCE (inline)
- Eliminates external dependency
- ONCE becomes fully self-sufficient

**Current State**: Delegated at `NodeJsOnce.ts:3069`
```typescript
await web4ts.componentStart(componentName, version);
```

---

## Descriptor Format Gap (D1, D4)

### Current `ONCE.component.json` (WRONG)

```json
{
  "ior": { "uuid": "...", "component": "Web4TSComponent", "version": "0.3.22.1" },
  "owner": "system",
  "model": {
    // ... model fields ...
  }
  // ❌ MISSING: "unit" field
}
```

### Required Format (CORRECT)

```json
{
  "ior": { "uuid": "...", "component": "Web4TSComponent", "version": "0.3.22.1" },
  "owner": "system",
  "model": {
    "uuid": "...",
    "name": "ONCE",
    "version": "0.3.22.1",
    "units": [
      "/EAMD.ucp/components/ONCE/0.3.22.1/src/ts/layer5/views/css/FileItemView.css",
      "/EAMD.ucp/components/ONCE/0.3.22.1/package.json"
    ]
    // ... other model fields ...
  },
  "unit": {
    "ior": { "uuid": "descriptor-unit-uuid-v4", "component": "Unit", "version": "0.3.22.1" },
    "owner": "system",
    "model": {
      "uuid": "descriptor-unit-uuid-v4",
      "name": "ONCE.component.json",
      "origin": "ior:git:github.com/.../ONCE.component.json",
      "filePath": "ONCE.component.json",
      "mimetype": "application/json",
      "symlinkPaths": ["components/ONCE/0.3.22.1/ONCE.component.json.unit"]
    }
  }
}
```

### Fix Path

1. Migrate `componentDescriptorUpdate()` from external Web4TSComponent
2. Modify to output `{ ior, owner, model, unit }` structure
3. Ensure `model.units` is flat `Collection<IOR>` (no categories)
4. Create `ONCE.component.json.unit` symlink

---

## Related Patterns

### JsInterface Pattern (P35)

For runtime interfaces that need to exist in JavaScript (for RelatedObjects, implementation lookup):

- **Pattern Document**: [§/session/web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)
- **Naming Convention**:
  - `Xxx.interface.ts` → `interface Xxx` (compile-time)
  - `XxxJsInterface.ts` → `abstract class XxxJsInterface extends JsInterface implements Xxx` (runtime)
  - `DefaultXxx.ts` → `class DefaultXxx extends UcpComponent<XxxModel> implements XxxJsInterface`

**Example**: File/Folder hierarchy
- `File.interface.ts` → `interface File`
- `FileJsInterface.ts` → `abstract class FileJsInterface extends JsInterface implements File`
- `DefaultFile.ts` → `class DefaultFile extends UcpComponent<FileModel> implements FileJsInterface`

---

## References

- **Unit README**: [§/components/Unit/0.3.0.5/README.md](../../../Unit/0.3.0.5/README.md)
- **Web4TSComponent README**: [§/components/Web4TSComponent/0.3.20.6/README.md](../../../Web4TSComponent/0.3.20.6/README.md)
- **JsInterface Pattern**: [§/session/web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)
- **Generator**: `src/ts/layer2/DefaultWeb4TSComponent.ts` (units live here)
- **Legacy**: `src/ts/layer2/UnitDiscoveryService.ts` (to be deprecated/removed)
- **Test14**: `test/tootsie/Test14_CSSUnitCreation.ts`

