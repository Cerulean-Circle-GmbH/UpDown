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

The descriptor IS a `Scenario<Web4TSComponentModel>` with its own `unit`:

```json
{
  "ior": {
    "uuid": "once-0.3.22.1-component",
    "component": "Web4TSComponent",
    "version": "0.3.20.6"
  },
  "owner": "system",
  "model": {
    "uuid": "once-0.3.22.1-component",
    "name": "ONCE",
    "version": "0.3.22.1",
    "description": "Open Network Compute Environment - Web4 Kernel",
    "layer2Implementation": "NodeJsOnce",
    "entryPoints": {
      "cli": "src/ts/layer5/ONCECLI.ts",
      "node": "dist/ts/layer2/NodeJsOnce.js",
      "browser": "dist/ts/layer2/BrowserOnce.js"
    },
    "units": {
      "css": [ /* Unit UUIDs or IORs */ ],
      "templates": [ /* Unit UUIDs or IORs */ ],
      "typescript": [ /* Unit UUIDs or IORs */ ],
      "configuration": [ /* package.json, tsconfig.json */ ],
      "lifecycle": [ /* build.sh, install-deps.sh, clean.sh */ ]
    },
    "dependencies": {
      "lit": "^3.2.0",
      "typescript": "^5.0.0"
    }
  },
  "unit": {
    "indexPath": "index/{uuid-path}/{uuid}.scenario.json",
    "symlinkPaths": [
      "type/Web4TSComponent/0.3.20.6",
      "components/ONCE/0.3.22.1/ONCE.component.json.unit"
    ],
    "references": [],
    "schemaVersion": "1.1.0",
    "createdBy": "Web4TSComponent/0.3.20.6"
  }
}
```

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

## Unit Categories

### CSS Units
- Purpose: Stylesheets for views
- Discovery: `**/*.css` in `src/`
- Loaded by: CSS Preloader via component descriptor

### Template Units  
- Purpose: HTML templates for views
- Discovery: `**/*.html` in `src/view/`
- Loaded by: HTMLTemplateLoader

### TypeScript Units
- Purpose: Implementation code
- Discovery: `**/*.ts` in `src/ts/`
- Built by: `tsc` via `build.sh`

### Configuration Units
- Purpose: Tool configuration
- Files: `package.json`, `tsconfig.json`, `vitest.config.ts`
- Used by: npm, tsc, vitest

### Lifecycle Units
- Purpose: Component lifecycle management
- Files: `src/sh/build.sh`, `install-deps.sh`, `clean.sh`, `start.sh`
- Stages: Download → Install → Build → Test → Start → Clean → Uninstall

---

## Generator Flow

Units are NOT manually created. The flow is:

```
1. Developer creates file
   └── src/ts/layer5/views/css/NewView.css

2. UnitDiscoveryService.unitsDiscover()
   └── Finds files matching patterns (*.css, *.html, *.ts)

3. UnitDiscoveryService.unitCreate()
   └── Creates scenario with UUID, origin IOR, filePath

4. UnitDiscoveryService.unitSave()
   └── Saves to scenarios/index/{uuid-path}/
   └── Creates {file}.unit symlink

5. UnitDiscoveryService.manifestUpdate()
   └── Updates {Name}.component.json with all units

Triggered by: `./once build` or `Test14_CSSUnitCreation`
```

---

## CSS Preloader Integration

The CSS preloader reads the component descriptor to find CSS units:

```typescript
// In BrowserOnceOrchestrator.assetsPreload()
const componentJson = await new IOR().init('/ONCE/0.3.22.1/ONCE.component.json').load();
const cssUnits = componentJson.model.units.css;

for (const unitRef of cssUnits) {
  // Load each CSS unit via IOR
  const cssIOR = new IOR().init(unitRef);
  await cssIOR.load();
}
```

---

## Why Units Matter

1. **Deduplication**: Same content = same unit UUID (content-addressable)
2. **Traceability**: Origin IOR tracks where file came from
3. **Caching**: Service Worker caches by unit UUID
4. **Discovery**: Component knows all its files via descriptor
5. **Lifecycle**: Scripts handle download → uninstall cycle

---

## References

- **Unit README**: [§/components/Unit/0.3.0.5/README.md](../../../Unit/0.3.0.5/README.md)
- **Web4TSComponent README**: [§/components/Web4TSComponent/0.3.20.6/README.md](../../../Web4TSComponent/0.3.20.6/README.md)
- **UnitDiscoveryService**: `src/ts/layer2/UnitDiscoveryService.ts`
- **Test14**: `test/tootsie/Test14_CSSUnitCreation.ts`

