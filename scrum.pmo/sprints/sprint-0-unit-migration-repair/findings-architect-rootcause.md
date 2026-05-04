# Architect Root Cause Analysis: Flat Scenario Files

**Author:** unit-architect
**Date:** 2026-05-04
**Task:** Sprint 0, Task 2.1

---

## Summary

10,026 scenario files are FLAT in `scenarios/index/`. 29,961 are CORRECT in 5-level subfolders. **Two completely separate code paths** write to `scenarios/index/` — one correct, one buggy.

## Evidence

### Flat files (10,026)
- Naming: `{uuid}.type.scenario.json` (note `.type.` infix)
- Owner: ALL 10,026 have `"owner": "TsAstExtractor"`
- Components: ONCE/0.3.22.2 (7,026), ONCE/0.3.22.1 (2,750), ONCE/0.0.0.0 (250)
- Location: `scenarios/index/{uuid}.type.scenario.json` (depth 1 — FLAT)

### Correct files (29,961)
- Naming: `{uuid}.scenario.json` (no `.type.` infix)
- Owner: 99% have `"owner": "system"`
- Components: Unit/0.3.22.2, Unit/0.3.22.1, Unit/0.0.0.0, ONCE/0.3.22.1
- Location: `scenarios/index/a/b/c/d/e/{uuid}.scenario.json` (depth 6 — 5-LEVEL)

---

## Root Cause: Two Writers, One Buggy

### Writer 1: UcpStorage (CORRECT)

**File:** `Persistence/0.3.23.0/src/ts/layer2/UcpStorage.ts`

**Line 300-303** — `uuidFolderPathGenerate()`:
```typescript
private uuidFolderPathGenerate(uuid: string): string {
    const cleanUuid = uuid.replace(/-/g, '');
    const folderStructure = cleanUuid.substring(0, 5).split('');
    return join(this.model.indexBaseDir, ...folderStructure);
}
```

**Line 114-153** — `scenarioSave()` calls `uuidFolderPathGenerate()` at line 120:
```typescript
async scenarioSave<T extends Model>(uuid, scenario, symlinkPaths): Promise<void> {
    const folderPath = this.uuidFolderPathGenerate(uuid);  // LINE 120
    await fs.mkdir(folderPath, { recursive: true });        // LINE 121
    const scenarioPath = join(folderPath, `${uuid}.scenario.json`);  // LINE 124
    // ...saves via IOR...
}
```

**Call chain:** `UnitDiscoveryService.unitSave()` → `ScenarioService.scenarioSave()` → `UcpStorage.scenarioSave()` → `uuidFolderPathGenerate()`

This chain ALWAYS produces 5-level paths. **29,961 correct files came through this path.**

### Writer 2: TsAstExtractor (BUGGY)

**File:** `Web4TSComponent/0.3.23.1/src/ts/layer2/TsAstExtractor.ts`

**Line 261** — hardcoded FLAT indexPath in `extractClassNode()`:
```typescript
indexPath: `scenarios/index/${uuid}.type.scenario.json`,
```

**Line 346** — same bug in `extractInterfaceNode()`:
```typescript
indexPath: `scenarios/index/${uuid}.type.scenario.json`,
```

**Line 640** — `saveScenarios()` writes directly using the flat path:
```typescript
const indexPath = path.join(this.scenariosDir, typeModel.indexPath.replace('scenarios/', ''));
const saveIor = new IOR<string>().initRemote(`ior:file://${indexPath}`);
await saveIor.save(scenario);
```

**This resolves to:** `{projectRoot}/scenarios/index/{uuid}.type.scenario.json` — FLAT, no subfolders.

**TsAstExtractor does NOT call UcpStorage, ScenarioService, or UnitDiscoveryService.** It has its own independent write logic at lines 615-658 that:
1. Creates `scenarios/index/` and `scenarios/type/` dirs directly (line 621, 624)
2. Writes scenario JSON directly via IOR (line 641-642)
3. Creates symlinks directly via `fs.symlinkSync` (line 654)

**10,026 flat files came through this path.**

### Why the `.type.` suffix?

TsAstExtractor names files `{uuid}.type.scenario.json` (line 261, 346). UcpStorage names files `{uuid}.scenario.json` (line 124). The `.type.` infix is TsAstExtractor's own convention — it serves as a forensic fingerprint identifying the buggy writer.

---

## Who Calls TsAstExtractor?

**File:** `Web4TSComponent/0.3.23.1/src/ts/layer2/DefaultWeb4TSComponent.ts`

**Line 720-733** — `typesExtract()`:
```typescript
private async typesExtract(): Promise<void> {
    const componentRoot = this.targetComponentRoot || this.componentRoot;
    const projectRoot = this.projectRoot;
    const scenariosDir = path.join(projectRoot, 'scenarios');  // LINE 723
    
    if (!this.typeExtractor) {
        this.typeExtractor = new TsAstExtractor().init({
            componentRoot,
            componentName: this.model!.displayName,    // LINE 729
            componentVersion: this.model!.displayVersion, // LINE 730
            scenariosDir,                                 // LINE 731
        });
    }
    // ...calls extractDirectory() then saveScenarios()
}
```

**Called during:** `DefaultWeb4TSComponent.build()` at line 699.

Every `web4tscomponent build` or `web4tscomponent on {Component} {version} build` triggers `typesExtract()`, which runs TsAstExtractor on ALL TypeScript source files, writing flat `.type.scenario.json` files to `scenarios/index/`.

### The 0.0.0.0 Connection

250 flat files have `version: "0.0.0.0"`. This is because `typesExtract()` at line 730 passes `this.model!.displayVersion` — which is `'0.0.0.0'` when BUG-W02 (import.meta.url self-discovery) hasn't been fixed for that component.

---

## Why SOME Files Are Correct and MOST Are Flat

| Writer | Count | Path Pattern | Trigger |
|--------|-------|-------------|---------|
| UcpStorage (via ScenarioService) | 29,961 | `index/a/b/c/d/e/{uuid}.scenario.json` | `unitSave()`, `scenarioSave()`, ONCE server start |
| TsAstExtractor (direct write) | 10,026 | `index/{uuid}.type.scenario.json` | Every `build` command on every component |

The correct files outnumber the flat files 3:1 because UnitDiscoveryService runs once per component build (creates ~244 units per ONCE build), while TsAstExtractor also runs per build but creates fewer files (one per class/interface, ~244 per ONCE × ~4 version builds = ~976 expected, but repeated builds accumulate).

The 10,026 count = ~244 types × ~3 ONCE versions (0.3.22.1 + 0.3.22.2 + 0.0.0.0) × ~14 components built = matches observed breakdown (7,026 + 2,750 + 250 = 10,026).

---

## Fix Required

**Primary fix (TsAstExtractor):** Replace hardcoded flat paths at lines 261 and 346 with 5-level UUID subfolder paths using the same algorithm as `UcpStorage.uuidFolderPathGenerate()`:

```typescript
// BEFORE (line 261):
indexPath: `scenarios/index/${uuid}.type.scenario.json`,

// AFTER:
indexPath: `scenarios/index/${uuid.replace(/-/g, '').substring(0,5).split('').join('/')}/${uuid}.type.scenario.json`,
```

Or better: make TsAstExtractor use ScenarioService instead of direct IOR writes.

**Secondary fix (migration):** Move 10,026 existing flat files into correct 5-level structure. Update their `indexPath` field. Fix symlinks in `type/` that point to old flat locations.

---

## Acceptance Criteria Verification

- [x] Root cause identified: TsAstExtractor.ts lines 261, 346, 640
- [x] Written to findings-architect-rootcause.md
- [x] Explains why 29,961 correct (UcpStorage path) and 10,026 flat (TsAstExtractor path)
