# Expert Source Analysis: Storage Layer (Sprint 0, Tasks 1.1-1.3)

**Author:** unit-expert  
**Date:** 2026-05-04

---

## 1. UcpStorage (@web4x/persistence 0.3.23.0)

**File:** `Persistence/0.3.23.0/src/ts/layer2/UcpStorage.ts`  
**Lines:** 536  
**Class:** `UcpStorage extends Storage` (also registers as `PersistenceManager`)

### What It Does
UUID-indexed scenario storage with symbolic link views. The single source of truth for persisting scenarios to filesystem.

### Storage Structure
```
scenarios/
├── index/{a}/{b}/{c}/{d}/{e}/{uuid}.scenario.json   ← PRIMARY (5-level UUID path)
├── type/{Component}/{version}/...                    ← SYMLINKS (by component type)
├── domain/{domain}/{hostname}/{Component}/{version}/ ← SYMLINKS (by network domain)
└── capability/{type}/{value}/...                     ← SYMLINKS (by capability)
```

### Methods (21 total)

| Method | Purpose |
|--------|---------|
| `static start()` | Register with TypeRegistry as Storage + PersistenceManager implementation |
| `init(scenario)` | Initialize with projectRoot, indexBaseDir from scenario |
| `scenarioSave(uuid, scenario, symlinkPaths)` | Save scenario JSON via IOR, create symlinks |
| `scenarioLoad(uuid)` | Load scenario from index via IOR |
| `scenarioFind(query)` | Search by domain/component/version/capability |
| `scenarioDelete(uuid, removeSymlinks?)` | Delete scenario + optional symlink cleanup |
| `scenarioExists(uuid)` | Check existence |
| `toScenario()` | Hibernate storage state |
| `typePathBuild(component, version)` | Build relative type symlink path |
| `domainPathBuild(parts, hostname, comp, ver)` | Build relative domain symlink path |
| `capabilityPathBuild(parts, host, comp, ver, type, val)` | Build relative capability symlink path |
| `typeLinkPathGenerate()` | [DEPRECATED] Full type path |
| `domainLinkPathGenerate()` | [DEPRECATED] Full domain path |
| `capabilityLinkPathGenerate()` | [DEPRECATED] Full capability path |
| `private uuidFolderPathGenerate(uuid)` | 5-level UUID → folder path |
| `private scenarioIndexPathGet(uuid)` | UUID → full index file path |
| `private symlinkCreate(indexPath, symlinkPath)` | Create relative symlink (idempotent) |
| `private projectRootFind()` | Walk up until `scenarios/` found |
| `private scenarioFilesFind(dir)` | Recursive .scenario.json finder |
| `private componentVersionGet()` | Read version from package.json via IOR |
| `private componentNameGet()` | Read name from package.json via IOR |

### Key Design Choices
- Uses `IOR` for all file I/O (via `@web4x/ucp/dist/ts/layer4/IOR.js`)
- Relative symlinks (portable across machines)
- Idempotent symlink creation (handles existing/stale links)
- ScenarioQuery supports domain AND/OR component AND/OR capability filtering

---

## 2. ScenarioService (@web4x/unit 0.3.23.1)

**File:** `Unit/0.3.23.1/src/ts/layer2/ScenarioService.ts`  
**Lines:** 439  
**Class:** `ScenarioService` (standalone, delegates to PersistenceManager)

### What It Does
Higher-level scenario orchestration. Wraps PersistenceManager with:
- Automatic unit metadata (ScenarioUnit tracking)
- Convention-based migration on load
- Reference tracking with SyncStatus
- Schema versioning

### Methods (18 total)

| Method | Purpose |
|--------|---------|
| `init(config)` | Initialize with PersistenceManager + component reference |
| `scenarioCreate(config)` | Create scenario with IOR, unit metadata, indexPath |
| `scenarioSave(scenario, symlinkPaths)` | Ensure unit metadata → delegate to PersistenceManager |
| `scenarioLoad(uuid)` | Load → auto-migrate → return |
| `scenarioDelete(uuid, removeSymlinks?)` | Delegate delete |
| `scenarioExists(uuid)` | Delegate existence check |
| `scenarioMigrate(scenario)` | Run convention-based migration + ensure unit metadata |
| `indexPathBuild(uuid)` | UUID → hierarchical index path (first 5 chars) |
| `typePathBuild(comp, ver)` | Delegate to PersistenceManager |
| `domainPathBuild(...)` | Delegate to PersistenceManager |
| `capabilityPathBuild(...)` | Delegate to PersistenceManager |
| `referenceTrack(scenario, location, target)` | Add/update reference with SYNCED status |
| `referenceCreate(location, uuid)` | Create UnitReference object |
| `referenceBroken(scenario, location)` | Mark reference as BROKEN |
| `private migrateViaConvention(scenario, sourceVer)` | Find and call `upgradeScenarioFromX_Y_Z()` on component |
| `private unitAdd(scenario)` | Add unit metadata to legacy scenario |
| `private unitEnsure(scenario, symlinkPaths)` | Ensure unit metadata exists |

### Migration Pattern
```typescript
// Convention: component defines method named after source version
component.upgradeScenarioFrom0_3_21_7(scenario)  // called automatically on load
```
- Triggered on every `scenarioLoad()`
- Version extracted from scenario IOR
- If migration method not found → no-op (graceful)
- Updates timestamps and IOR version post-migration

### Relationship to UcpStorage
ScenarioService **delegates** to UcpStorage (via PersistenceManager interface). It adds:
- Unit metadata (ScenarioUnit with schemaVersion, references, timestamps)
- Migration logic
- Reference tracking with SyncStatus

---

## 3. UnitDiscoveryService (@web4x/unit 0.3.23.1)

**File:** `Unit/0.3.23.1/src/ts/layer2/UnitDiscoveryService.ts`  
**Lines:** 503  
**Class:** `UnitDiscoveryService` (standalone)

### What It Does
Discovers files in a component directory by pattern, creates unit scenarios for each, manages .unit symlinks, and generates component manifests.

### Methods (14 total)

| Method | Purpose |
|--------|---------|
| `init(config)` | Initialize with ScenarioService + component paths |
| `unitsDiscover(directory, pattern)` | Scan directory for files matching glob pattern |
| `unitCreate(definition, originPath?)` | Create unit scenario for a discovered file |
| `unitSave(result)` | Save unit + create .unit symlink in scenarios/type/ |
| `tsUnitCreate(classFilePath, m3UnitScenario)` | Create .ts.unit file next to source with bidirectional references |
| `manifestUnitsGenerate()` | Generate ManifestUnits from existing .unit symlinks |
| `manifestUpdate(manifestPath)` | Update/create component manifest file |
| `private scanDirectory(dir, pattern, results)` | Recursive directory scan |
| `private matchesPattern(filename, glob)` | Extension-based glob matching |
| `private generateDescription(filename, typeM3)` | TypeM3-specific description generation |
| `private collectManifestUnits(dir, units)` | Collect .unit symlinks for manifest |
| `private parseUnitSymlink(path, name)` | Parse symlink → ManifestUnit |
| `private getMimeType(filename)` | Filename → MIME type |

### Discovery Flow
```
1. unitsDiscover(dir, pattern)
   → scanDirectory() recursively
   → matchesPattern() by extension
   → checks for existing .unit symlinks (reuses UUID)
   → returns UnitDefinition[]

2. unitCreate(definition)
   → creates DiscoveredUnitModel (uuid, typeM3, origin IOR, timestamps)
   → scenarioService.scenarioCreate()
   → returns DiscoveryResult with unitSymlinkPath

3. unitSave(result)
   → scenarioService.scenarioSave()
   → creates symlink: scenarios/type/{name}/{version}/{file}.unit → scenarios/index/...

4. tsUnitCreate(classFilePath, m3Unit)
   → writes {classFilePath}.unit JSON file
   → adds back-link in m3Unit.references[]
```

### Key: NOT in prod (0.3.0.5)
UnitDiscoveryService is **new** — prod's DefaultUnit handles discovery inline in its `discover()` method (different approach: grep-based search vs pattern-based scan).

---

## 4. Prod DefaultStorage (Unit 0.3.0.5)

**File:** `Unit/0.3.0.5/src/ts/layer2/DefaultStorage.ts`  
**Lines:** 173  
**Class:** `DefaultStorage implements Storage`

### What It Does
Same UUID index pattern as UcpStorage but simpler (no IOR, no ScenarioQuery, no capability paths).

### Methods (11 total)

| Method | Purpose |
|--------|---------|
| `constructor()` | Empty, initializes model with UUID |
| `init(scenario)` | Set projectRoot, indexBaseDir |
| `toScenario()` | Hibernate with dynamic version/name |
| `saveScenario(uuid, scenario, symlinkPaths)` | Save JSON + create symlinks |
| `loadScenario(uuid)` | Load JSON from index |
| `private generateUUIDFolderPath(uuid)` | 5-level UUID path |
| `private getScenarioIndexPath(uuid)` | UUID → full path |
| `private createSymbolicLink(indexPath, symlinkPath)` | Create relative symlink |
| `private findProjectRoot()` | Walk up for scenarios/ |
| `private getComponentVersion()` | Read package.json |
| `private getComponentName()` | Read package.json |

### Comparison: DefaultStorage vs UcpStorage

| Aspect | DefaultStorage (prod) | UcpStorage (0.3.23.0) |
|--------|----------------------|----------------------|
| Lines | 173 | 536 |
| UUID structure | Same 5-level | Same 5-level |
| Symlink creation | Same relative pattern | Same + idempotent handling |
| File I/O | Direct `fs.readFile`/`fs.writeFile` | Via `IOR` (P2P pattern) |
| Query | No query API | `scenarioFind(ScenarioQuery)` |
| Path builders | None | type/domain/capability path builders |
| Registration | None | JsInterface static start() |
| Capability views | None | capability/{type}/{value}/ symlinks |
| Domain views | None | domain/{parts}/{hostname}/ symlinks |

**Verdict:** UcpStorage is a **superset** of DefaultStorage. All prod functionality is preserved + extended. PO decision to NOT port DefaultStorage is correct.

---

## Summary: How the Three Files Relate

```
┌─────────────────────────────────────────────────────┐
│ UnitDiscoveryService                                 │
│ (discovers files, creates unit scenarios)            │
│                                                     │
│  unitsDiscover() → unitCreate() → unitSave()        │
│  tsUnitCreate() (M3 CLASS linking)                  │
│  manifestUpdate() (component manifest)              │
└──────────────────┬──────────────────────────────────┘
                   │ delegates to
                   ▼
┌─────────────────────────────────────────────────────┐
│ ScenarioService                                      │
│ (orchestrates: migration, unit metadata, references) │
│                                                     │
│  scenarioCreate() → scenarioSave() → scenarioLoad() │
│  scenarioMigrate() (convention-based)               │
│  referenceTrack() / referenceBroken()               │
└──────────────────┬──────────────────────────────────┘
                   │ delegates to
                   ▼
┌─────────────────────────────────────────────────────┐
│ UcpStorage (PersistenceManager)                      │
│ (raw persistence: UUID index, symlinks, IOR I/O)    │
│                                                     │
│  scenarioSave() → scenarioLoad() → scenarioFind()   │
│  symlinkCreate() (type/domain/capability views)     │
└─────────────────────────────────────────────────────┘
```

**Three layers of delegation:**
1. **UnitDiscoveryService** — file-level concerns (scan, pattern match, .unit symlinks)
2. **ScenarioService** — scenario-level concerns (metadata, migration, references)
3. **UcpStorage** — storage-level concerns (UUID index, symlinks, IOR I/O)

Prod's `DefaultUnit` (2,999 lines) did all three roles in one class. The extraction split responsibilities correctly per Web4 P19 (One File One Type).
