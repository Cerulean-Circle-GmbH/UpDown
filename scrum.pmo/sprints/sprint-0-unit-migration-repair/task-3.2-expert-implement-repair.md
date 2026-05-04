[Back to Sprint 0 Planning](./planning.md) | [Back to Task 3](./task-3-implement-repair.md)

# Task 3.2: Expert — Implement `UnitRepair` Class
[task:uuid:d1e2f3a4-b5c6-7890-defg-400000030002]

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement
  - [ ] creating test cases
  - [x] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [Task 3: Implement Repair Function](./task-3-implement-repair.md)
  - down
    - none (atomic subtask)

## Task Description
Create `UnitRepair.ts` in Unit/0.3.23.1 that fixes the 39,987 flat scenario files in `scenarios/index/`.

## Context
Audit found:
- 39,987 `.type.scenario.json` files FLAT in `scenarios/index/` instead of 5-level UUID subfolder (`index/{a}/{b}/{c}/{d}/{e}/uuid.scenario.json`)
- Files also have wrong suffix `.type.scenario.json` instead of `.scenario.json`
- Correct structure already exists in `index/0/` through `index/f/` — so some units went right

## Implementation

### File
`/Users/Shared/Workspaces/AI/Claude.All/UpDown/components/Unit/0.3.23.1/src/ts/layer2/UnitRepair.ts`

### Class: UnitRepair
```typescript
export class UnitRepair {
  /**
   * Repair flat scenario files in index/ root
   * Moves them to correct 5-level UUID subfolder structure
   * Renames .type.scenario.json → .scenario.json
   * Updates indexPath field inside JSON
   */
  static async repairFlatIndexFiles(scenariosPath: string): Promise<RepairResult>

  /**
   * Remove astray top-level directories (ONCE/, box/, components/, local.once/)
   * Only index/, domain/, type/ should exist at scenarios root
   */
  static async repairAstrayDirectories(scenariosPath: string): Promise<RepairResult>

  /**
   * Compute 5-level UUID folder path
   * e.g., "44443290-015c-..." → "4/4/4/4/3"
   */
  private static uuidToFolderPath(uuid: string): string
}

interface RepairResult {
  moved: number;
  errors: string[];
  skipped: number;
}
```

### Algorithm for repairFlatIndexFiles
1. `readdir(indexPath)` — filter for `*.scenario.json` and `*.type.scenario.json` files (NOT directories)
2. For each file:
   a. Extract UUID from filename (strip `.type.scenario.json` or `.scenario.json` suffix)
   b. Compute folder: UUID without dashes, chars 0-4 as subdirs → `index/a/b/c/d/e/`
   c. `mkdir -p` target folder
   d. Target filename: `{uuid}.scenario.json` (drop `.type.` prefix if present)
   e. Read JSON, update `model.indexPath` to new path
   f. Write to target path
   g. Remove original flat file
3. Return count of moved, errors, skipped

### Use Node.js fs/path only — no IOR dependency (repair must work standalone)

## Build
```bash
cd /Users/Shared/Workspaces/AI/Claude.All/UpDown/components/Unit/0.3.23.1
npx tsc
```

## Acceptance Criteria
- [ ] `UnitRepair.ts` exists in Unit/0.3.23.1/src/ts/layer2/
- [ ] `npx tsc` — zero errors
- [ ] `UnitRepair.repairFlatIndexFiles()` moves flat files to correct 5-level structure
- [ ] `.type.scenario.json` renamed to `.scenario.json` during move
- [ ] `model.indexPath` updated inside each moved JSON
- [ ] `UnitRepair.repairAstrayDirectories()` removes ONCE/, box/, components/, local.once/ from scenarios root
- [ ] Returns RepairResult with count of moved/errors/skipped

## Test (Tester runs after implementation)
```bash
# Test on small subset first
node -e "
  import { UnitRepair } from './dist/ts/layer2/UnitRepair.js';
  const result = await UnitRepair.repairFlatIndexFiles('/Users/Shared/Workspaces/AI/Claude/workspaces/UpDown/scenarios');
  console.log(result);
"
```
