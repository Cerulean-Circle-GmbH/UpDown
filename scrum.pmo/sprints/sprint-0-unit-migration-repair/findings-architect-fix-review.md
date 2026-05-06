# Architect Fix Review: TsAstExtractor 5-Level UUID Path

**Author:** unit-architect
**Date:** 2026-05-04
**Task:** Sprint 0, Task 2.1 — Fix Review

---

## Diff Summary

4 changes in `Web4TSComponent/0.3.23.1/src/ts/layer2/TsAstExtractor.ts`:

| Location | Before | After | Verdict |
|----------|--------|-------|---------|
| Line 261 (class indexPath) | `scenarios/index/${uuid}.type.scenario.json` | `this.uuidToIndexPath(uuid)` | **FIXED** |
| Line 263 (class symlinkPath) | `scenarios/type/${className}.type.scenario.json` | `scenarios/type/${className}.scenario.json` | **FIXED** |
| Line 346 (interface indexPath) | `scenarios/index/${uuid}.type.scenario.json` | `this.uuidToIndexPath(uuid)` | **FIXED** |
| Line 348 (interface symlinkPath) | `scenarios/type/${interfaceName}.type.scenario.json` | `scenarios/type/${interfaceName}.scenario.json` | **FIXED** |
| New method (line 612-618) | N/A | `uuidToIndexPath(uuid)` — 5-level algorithm | **CORRECT** |
| Line 647-650 (saveScenarios) | No folder creation | `mkdirSync(indexFolder, { recursive: true })` | **CORRECT** |

---

## Verification Against Root Cause

### RC1: Line 261 hardcoded flat path — FIXED
Before: `scenarios/index/${uuid}.type.scenario.json`
After: `this.uuidToIndexPath(uuid)` → `scenarios/index/a/b/c/d/e/${uuid}.scenario.json`

### RC2: Line 346 hardcoded flat path — FIXED
Same fix as RC1.

### RC3: Line 640 writes without folder creation — FIXED
Added lines 647-650: `mkdirSync(indexFolder, { recursive: true })` before the IOR save. This creates the 5-level subfolder structure before writing.

### RC4: `.type.` suffix removed — FIXED
Both symlink paths changed from `.type.scenario.json` to `.scenario.json`. The new `uuidToIndexPath()` method also outputs `.scenario.json` without `.type.`.

---

## Algorithm Correctness

New method `uuidToIndexPath()` at line 612-618:

```typescript
private uuidToIndexPath(uuid: string): string {
    const clean = uuid.replace(/-/g, '');
    const folders = clean.substring(0, 5).split('');
    return `scenarios/index/${folders.join('/')}/${uuid}.scenario.json`;
}
```

Compared to UcpStorage `uuidFolderPathGenerate()` at line 300-303:

```typescript
private uuidFolderPathGenerate(uuid: string): string {
    const cleanUuid = uuid.replace(/-/g, '');
    const folderStructure = cleanUuid.substring(0, 5).split('');
    return join(this.model.indexBaseDir, ...folderStructure);
}
```

**Same algorithm:** strip hyphens, take first 5 chars, split into individual folder levels. Output format differs only in that UcpStorage uses `path.join()` with `indexBaseDir` while TsAstExtractor returns a relative string with `scenarios/index/` prefix. Both produce the same 5-level structure.

**Example:** UUID `44443290-015c-4720-be80-c42caf842252`
- Clean: `44443290015c4720be80c42caf842252`
- First 5: `44443`
- Split: `['4','4','4','4','3']`
- UcpStorage: `{indexBaseDir}/4/4/4/4/3/`
- TsAstExtractor: `scenarios/index/4/4/4/4/3/44443290-015c-4720-be80-c42caf842252.scenario.json`

**Correct.**

---

## What the Fix Does NOT Address

1. **TsAstExtractor still writes directly via IOR** — it does NOT use ScenarioService or UcpStorage. The fix replicates the 5-level algorithm locally rather than delegating. This is acceptable for Sprint 0 (minimal fix), but Sprint 1 should consider refactoring TsAstExtractor to use ScenarioService for DRY (P8).

2. **Existing 10,026 flat files are NOT migrated** — the fix prevents NEW flat files but doesn't repair old ones. Task 3.2 (migration script) handles this separately.

3. **Symlink targets in `scenarios/type/` still point to old flat locations** — the fix changes the naming convention for NEW symlinks (`.scenario.json` not `.type.scenario.json`) but doesn't update existing symlinks.

---

## Verdict

**APPROVED.** The fix correctly addresses all three root cause locations (lines 261, 346, 640+). The 5-level algorithm matches UcpStorage exactly. The `.type.` suffix removal aligns naming with UcpStorage convention. The `mkdirSync` addition ensures subfolders exist before write.

One architectural note for Sprint 1: the duplicated algorithm in `uuidToIndexPath()` should eventually be extracted to a shared utility or TsAstExtractor should delegate to ScenarioService. But for Sprint 0 the local fix is correct and minimal.
