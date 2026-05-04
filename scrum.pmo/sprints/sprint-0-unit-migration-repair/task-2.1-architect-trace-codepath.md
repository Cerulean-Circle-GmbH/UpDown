[Back to Sprint 0 Planning](./planning.md) | [Back to Task 2](./task-2-root-cause-analysis.md)

# Task 2.1: Architect — Trace Root Cause of Flat Files
[task:uuid:d1e2f3a4-b5c6-7890-defg-400000020001]

## Status
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Identify the exact code path that causes 39,987 scenario files to land flat in `scenarios/index/` instead of the 5-level UUID subfolder structure.

## Context
- UcpStorage.uuidFolderPathGenerate() correctly computes `index/a/b/c/d/e/` from UUID
- Yet 39,987 files are at `index/{uuid}.type.scenario.json` — FLAT
- Expert analysis (findings-expert-source-analysis.md) documents all 21 methods in UcpStorage

## Investigation Steps
1. Read UcpStorage.scenarioSave() — does it always call uuidFolderPathGenerate()?
2. Read ScenarioService.scenarioSave() — does it bypass UcpStorage?
3. Read UnitDiscoveryService — where does it write unit files?
4. Search for ANY direct fs.writeFile/writeFileSync calls that write to `index/` without using UcpStorage
5. Check if the `.type.` in filename is a clue — who adds that suffix?

## Acceptance Criteria
- [ ] Root cause identified with exact file, method, and line number
- [ ] Written to findings-architect-rootcause.md
- [ ] Explains why SOME files are correct (in subfolders) and MOST are flat

## Deliverable
`/Users/Shared/Workspaces/AI/Claude.All/UpDown/scrum.pmo/sprints/sprint-0-unit-migration-repair/findings-architect-rootcause.md`
