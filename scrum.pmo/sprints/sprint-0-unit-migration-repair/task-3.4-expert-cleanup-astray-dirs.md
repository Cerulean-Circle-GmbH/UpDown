[Back to Sprint 0 Planning](./planning.md)

# Task 3.4: Expert — Clean Astray Directories
[task:uuid:d1e2f3a4-b5c6-7890-defg-400000030004]

## Status
- [x] In Progress
- [ ] QA Review
- [ ] Done

## PO Decision (2026-05-04)
Based on expert findings on the 4 astray directories:

| Directory | Content | Decision |
|-----------|---------|----------|
| `components/` | Empty dirs, 0 files | **DELETE** |
| `local.once/` | Empty, 0 files | **DELETE** |
| `box/` | 10 stale symlinks from old hostname | **DELETE** |
| `ONCE/` | 118 real server scenarios (legacy format) | **ARCHIVE** to `scenarios/archive/ONCE-legacy-flat/` |

## Implementation Steps
```bash
SCENARIOS="/Users/Shared/Workspaces/AI/Claude/workspaces/UpDown/scenarios"

# 1. Delete empty dirs
rm -rf "$SCENARIOS/components" "$SCENARIOS/local.once"

# 2. Delete stale box/ symlinks
rm -rf "$SCENARIOS/box"

# 3. Archive ONCE/ legacy scenarios (preserve, don't destroy)
mkdir -p "$SCENARIOS/archive/ONCE-legacy-flat"
mv "$SCENARIOS/ONCE"/* "$SCENARIOS/archive/ONCE-legacy-flat/"
rmdir "$SCENARIOS/ONCE"

# 4. Verify only index/, domain/, type/, archive/ remain
ls "$SCENARIOS/"
```

## Acceptance Criteria
- [ ] `scenarios/` root contains ONLY: index/, domain/, type/, archive/
- [ ] `archive/ONCE-legacy-flat/` contains the 118 preserved scenarios
- [ ] Zero astray dirs remaining
- [ ] `ls scenarios/` shows clean structure

## Shell
Use unitTeam:0.3 for all commands.
