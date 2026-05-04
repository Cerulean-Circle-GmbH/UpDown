[Back to Sprint 0 Planning](./planning.md) | [Back to Task 4](./task-4-fix-root-causes.md)

# Task 4.1: Expert — Fix TsAstExtractor Flat Index Bug
[task:uuid:d1e2f3a4-b5c6-7890-defg-400000040001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [Root Cause Analysis](./findings-architect-rootcause.md)
  - down
    - none (atomic subtask)

## Root Cause (from Architect findings)
**TsAstExtractor.ts** in Web4TSComponent/0.3.23.1 writes scenario files FLAT to `scenarios/index/` at three locations:
1. **Line 261** `extractClassNode()`: hardcodes `indexPath: scenarios/index/${uuid}.type.scenario.json`
2. **Line 346** `extractInterfaceNode()`: same flat path
3. **Line 640** `saveScenarios()`: writes directly via IOR to the flat path, never calls UcpStorage

TsAstExtractor has its own independent write logic (lines 615-658) that bypasses UcpStorage/ScenarioService entirely. This produced 10,026 flat files.

## Fix Required

### Option A (Preferred): Make TsAstExtractor use ScenarioService
TsAstExtractor should delegate scenario writes to ScenarioService, which delegates to UcpStorage, which uses `uuidFolderPathGenerate()`. This ensures a single write path.

### Option B (Quick fix): Replicate 5-level algorithm in TsAstExtractor
If Option A creates circular deps (Web4TSComponent → Unit → UCP), replicate the UUID folder logic:
```typescript
// Replace line 261 and 346:
private uuidToIndexPath(uuid: string): string {
    const clean = uuid.replace(/-/g, '');
    const folders = clean.substring(0, 5).split('');
    return `scenarios/index/${folders.join('/')}/${uuid}.scenario.json`;
}
```
Also fix the `.type.` suffix — use `.scenario.json` not `.type.scenario.json`.

## File to Edit
`/Users/Shared/Workspaces/AI/Claude.All/UpDown/components/Web4TSComponent/0.3.23.1/src/ts/layer2/TsAstExtractor.ts`

## Specific Changes
1. Lines 261, 346: Replace flat `indexPath` with 5-level UUID path
2. Remove `.type.` from filename suffix (use `.scenario.json`)
3. Line 640: `saveScenarios()` must `mkdir -p` the 5-level subfolder before writing
4. Line 621: Remove direct `scenarios/index/` mkdir (subfolders handle it)

## Build & Verify
```bash
cd /Users/Shared/Workspaces/AI/Claude.All/UpDown/components/Web4TSComponent/0.3.23.1
npx tsc
# PASS: zero errors
```

## Acceptance Criteria
- [ ] TsAstExtractor generates 5-level UUID paths, not flat
- [ ] Filename suffix is `.scenario.json` (no `.type.`)
- [ ] `saveScenarios()` creates UUID subfolders before writing
- [ ] `npx tsc` — zero errors
- [ ] New build of any component creates scenarios in correct 5-level structure (tester verifies)
