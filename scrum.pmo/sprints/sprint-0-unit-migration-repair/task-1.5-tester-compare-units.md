[Back to Sprint 0 Planning](./planning.md) | [Back to Task 1](./task-1-deep-read-unit-source.md)

# Task 1.5: Tester — Compare Correct vs Broken Unit Files
[task:uuid:d1e2f3a4-b5c6-7890-defg-400000010005]

## Status
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Using the tester shell (unitTeam:0.5), examine the scenarios directory and compare a correctly-placed unit vs a flat (broken) unit.

## Scenarios Path
`/Users/Shared/Workspaces/AI/Claude/workspaces/UpDown/scenarios/`

## Shell Commands (use otmux send unitTeam:0.5)
```bash
# 1. Find one CORRECT unit in subfolder
find scenarios/index/0 -name '*.scenario.json' -print -quit

# 2. Cat the correct unit
cat <path from step 1>

# 3. Find one FLAT unit in index root  
ls scenarios/index/*.type.scenario.json | head -1

# 4. Cat the flat unit
cat <path from step 3>

# 5. Are flat files real files or symlinks?
ls -la scenarios/index/*.type.scenario.json | head -3

# 6. Count broken symlinks in type/
find scenarios/type -type l ! -exec test -e {} \; -print | wc -l
```

## Acceptance Criteria
- [ ] One correct unit JSON captured and documented
- [ ] One flat unit JSON captured and documented
- [ ] Structural differences between them identified (indexPath, filename suffix, folder depth)
- [ ] File vs symlink status of flat files determined
- [ ] Broken symlink count measured
- [ ] Written to findings-tester-unit-comparison.md

## Deliverable
`/Users/Shared/Workspaces/AI/Claude.All/UpDown/scrum.pmo/sprints/sprint-0-unit-migration-repair/findings-tester-unit-comparison.md`
