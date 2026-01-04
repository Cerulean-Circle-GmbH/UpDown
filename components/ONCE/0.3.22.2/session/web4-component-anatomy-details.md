# Web4 Component Anatomy Details

**Checklist:** [§/session/web4-component-anatomy-checklist.md](./web4-component-anatomy-checklist.md)  
**Updated:** 2026-01-01

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

## Current State (2026-01-01) ✅

### `DefaultWeb4TSComponent.ts` — Key Methods

| Method | Purpose | Status |
|--------|---------|--------|
| `build()` | Compile TypeScript + generate units + descriptor | ✅ |
| `unitsDiscover()` | Find and create file + folder units | ✅ |
| `descriptorUpdate()` | Write `ONCE.component.json` | ✅ |
| `foldersDiscover()` | Create `°folder.unit` for directories | ✅ |
| `test()` | Run tootsie tests | ✅ |
| `clean()` | Remove build artifacts | ✅ |

### Component Descriptor — COMPLETE ✅

```json
{
  "ior": {
    "uuid": "...",
    "component": "Web4TSComponent",
    "version": "0.3.22.1"
  },
  "owner": "Base64(Scenario<UserModel>)",
  "model": {
    "uuid": "...",
    "name": "ONCE",
    "version": "0.3.22.1",
    "units": [
      "/EAMD.ucp/components/ONCE/0.3.22.1/src/ts/layer5/views/css/FileItemView.css",
      "/EAMD.ucp/components/ONCE/0.3.22.1/package.json",
      "... (519 total)"
    ]
  }
}
```

### Unit Symlinks — CORRECT LOCATION ✅

Units are now placed in `scenarios/type/` mirror:

```
scenarios/type/ONCE/0.3.22.1/src/ts/layer5/views/css/FileItemView.css.unit
  → ../../../../../../index/f/c/2/d/b/fc2db7d0-c205-4472-ae4d-3c301ce95090.scenario.json
```

**NOT** in component directory (old behavior).

### Folder Units — 26 Total ✅

```
scenarios/type/ONCE/0.3.22.1/src/°folder.unit
scenarios/type/ONCE/0.3.22.1/src/ts/layer1/°folder.unit
scenarios/type/ONCE/0.3.22.1/dist/ts/layer2/°folder.unit
... (26 total covering src/ and dist/)
```

---

## Related Patterns

### JsInterface Pattern (P35)

For runtime interfaces that need to exist in JavaScript (for RelatedObjects, implementation lookup):

- **Pattern Document**: [§/session/web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)
- **Naming Convention**:
  - `Xxx.interface.ts` → `interface Xxx` (compile-time)
  - `XxxJs.ts` → `abstract class XxxJs extends JsInterface implements Xxx` (runtime, for collision types)
  - `DefaultXxx.ts` → `class DefaultXxx extends UcpComponent<XxxModel> implements XxxJs`
- **Auto-Registration**: `static implements() { return [XxxJs]; }` + `super.start()`

**Example**: File/Folder hierarchy (collision with browser's File)
- `File.interface.ts` → `interface File`
- `FileJs.ts` → `abstract class FileJs extends JsInterface implements File`
- `DefaultFile.ts` → `class DefaultFile implements FileJs` with `static implements() { return [FileJs]; }`

---

## References

- **Unit README**: [§/components/Unit/0.3.0.5/README.md](../../../Unit/0.3.0.5/README.md)
- **Web4TSComponent README**: [§/components/Web4TSComponent/0.3.20.6/README.md](../../../Web4TSComponent/0.3.20.6/README.md)
- **JsInterface Pattern**: [§/session/web4-jsinterface-pattern.md](./web4-jsinterface-pattern.md)
- **Generator**: `src/ts/layer2/DefaultWeb4TSComponent.ts` (units live here)
- **Legacy**: `src/ts/layer2/UnitDiscoveryService.ts` (to be deprecated/removed)
- **Test14**: `test/tootsie/Test14_CSSUnitCreation.ts`

