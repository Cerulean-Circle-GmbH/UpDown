[Back to Sprint 0 Planning](./planning.md) | [Back to Task 1.5](./task-1.5-tester-compare-units.md)

# Findings: Correct vs Broken Unit Comparison

**Tester**: unit-tester
**Date**: 2026-05-04
**Path**: `/Users/Shared/Workspaces/AI/Claude/workspaces/UpDown/scenarios/`

---

## 1. Correct Unit (in UUID subfolder)

**File**: `index/0/9/9/7/0/09970590-a524-4861-9563-b55d96f22d12.scenario.json`

```json
{
  "ior": {
    "uuid": "09970590-a524-4861-9563-b55d96f22d12",
    "component": "Unit",
    "version": "0.3.22.1"
  },
  "owner": "system",
  "model": {
    "uuid": "09970590-a524-4861-9563-b55d96f22d12",
    "name": "TsAstExtractor.js",
    "typeM3": "CLASS",
    "origin": "ior:git:github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.22.1/src/ts/layer2/TsAstExtractor.ts",
    "definition": "TypeScript TsAstExtractor class/interface",
    "filePath": "dist/ts/layer2/TsAstExtractor.js",
    "mimetype": "application/javascript",
    "createdAt": "2026-01-01T19:39:00.470Z",
    "updatedAt": "2026-01-01T19:39:00.470Z",
    "indexPath": "/Users/Shared/Workspaces/2cuGitHub/UpDown/scenarios/index/0/9/9/7/0/09970590-a524-4861-9563-b55d96f22d12.scenario.json",
    "symlinkPaths": ["type/Unit/0.3.22.1"]
  },
  "unit": {
    "indexPath": "0/9/9/7/0/09970590-a524-4861-9563-b55d96f22d12.scenario.json",
    "symlinkPaths": ["type/Unit/0.3.22.1"],
    "references": [],
    "schemaVersion": "1.1.0",
    "createdBy": "Unit/0.3.22.1",
    "createdAt": "2026-01-01T19:39:00.470Z",
    "updatedAt": "2026-01-01T19:39:00.470Z"
  }
}
```

## 2. Flat (Broken) Unit (in index root)

**File**: `index/0000aeb1-847c-40b6-ab90-7daacc14f6e6.type.scenario.json`

```json
{
  "ior": {
    "uuid": "0000aeb1-847c-40b6-ab90-7daacc14f6e6",
    "component": "ONCE",
    "version": "0.3.22.2"
  },
  "owner": "TsAstExtractor",
  "model": {
    "uuid": "0000aeb1-847c-40b6-ab90-7daacc14f6e6",
    "name": "DefaultFolder",
    "extends": "ior:esm:/ONCE/0.3.22.2/UcpComponent",
    "implements": ["ior:esm:/ONCE/0.3.22.2/Container", "ior:esm:/ONCE/0.3.22.2/FolderJs"],
    "sourcePath": "src/ts/layer2/DefaultFolder.ts",
    "indexPath": "scenarios/index/0000aeb1-847c-40b6-ab90-7daacc14f6e6.type.scenario.json",
    "symlinkPaths": ["scenarios/type/DefaultFolder.type.scenario.json"],
    "attributes": [],
    "properties": [ ... ],
    "methods": [ ... ],
    "component": "ONCE",
    "version": "0.3.22.2",
    "createdAt": "2026-01-06T15:13:38.870Z",
    "updatedAt": "2026-01-06T15:13:38.870Z",
    "isInterface": false,
    "isAbstract": false
  }
}
```

## 3. Structural Differences

| Field | Correct Unit | Flat (Broken) Unit |
|-------|-------------|-------------------|
| **Filename** | `{uuid}.scenario.json` | `{uuid}.type.scenario.json` (extra `.type` suffix) |
| **Folder depth** | `index/0/9/9/7/0/{uuid}.scenario.json` (5-level UUID hash) | `index/{uuid}.type.scenario.json` (flat in root) |
| **ior.component** | `"Unit"` | `"ONCE"` (wrong — should be Unit) |
| **owner** | `"system"` | `"TsAstExtractor"` (tool name, not owner) |
| **model fields** | Standard Unit fields: `name`, `typeM3`, `origin`, `definition`, `filePath`, `mimetype` | MDAv4/AST fields: `extends`, `implements`, `properties`, `methods`, `isInterface`, `isAbstract` |
| **model.indexPath** | Absolute path to UUID subfolder | Relative flat path (no UUID hash structure) |
| **model.symlinkPaths** | `["type/Unit/0.3.22.1"]` | `["scenarios/type/DefaultFolder.type.scenario.json"]` (wrong prefix) |
| **unit section** | Present with `schemaVersion`, `createdBy`, `references` | **MISSING entirely** |
| **model.origin** | `ior:git:...` (git IOR to source file) | **MISSING** |
| **model.typeM3** | `"CLASS"` | **MISSING** (no TypeM3 enum) |

## 4. File vs Symlink Status

**Flat files are REAL files** (not symlinks):
```
-rw-r--r--@ 1 donges  wheel  14026 Mar 31 10:21 index/0000aeb1-...type.scenario.json
-rw-r--r--@ 1 donges  wheel   1904 Mar 31 10:21 index/000c7188-...type.scenario.json
-rw-r--r--@ 1 donges  wheel   2384 Mar 31 10:21 index/000f5f5b-...type.scenario.json
```

No symlink indicator (`l` in permissions). These are full JSON files dumped directly into index root.

## 5. Broken Symlink Count

**0 broken symlinks in `type/`**

## 6. Scale

| Category | Count |
|----------|-------|
| Flat files in `index/` root | **10,026** |
| Correct files in UUID subfolders | **29,961** |
| Broken symlinks in `type/` | **0** |

## 7. Root Cause Analysis

The flat files were created by `TsAstExtractor` (visible in `owner` field) — an AST parsing tool that generates MDAv4 type scenarios. It writes directly to `index/` root instead of using the UUID hash subfolder structure that `UnitDiscoveryService` uses.

**Key issues with flat files:**
1. **Wrong filename**: `.type.scenario.json` suffix instead of `.scenario.json`
2. **No UUID hash path**: Dumped flat instead of `a/b/c/d/e/uuid.scenario.json`
3. **Wrong ior.component**: Says `"ONCE"` instead of `"Unit"`
4. **No `unit` section**: Missing the metadata block with `schemaVersion`, `createdBy`, `references`
5. **No origin IOR**: Missing `ior:git:...` link to source file
6. **No typeM3**: Missing TypeM3 enum classification
7. **Wrong symlinkPaths prefix**: Includes `scenarios/` prefix in path

These are a different schema entirely — MDAv4 class descriptors, not Unit file tracking scenarios. They may need a separate migration path or a dedicated M3 scenario type.
