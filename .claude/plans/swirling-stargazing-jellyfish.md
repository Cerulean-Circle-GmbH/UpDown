# Plan: Update Web4 Training KB with `links fix` Ghost Feature Finding

## Context

The web4-expert investigated `links fix` and discovered it's a ghost feature — advertised in usage/completion but not implemented. The `action` parameter at line 759 of DefaultWeb4TSComponent.ts is accepted and ignored. Scripts/ symlinks are only created during `upgrade`, not `links`. This is important training knowledge: agents must know this before attempting `links fix`.

## Changes

### 1. Update `session/knowledge-base/web4-components.md`
Add to Known Bugs section:
- **BUG-W6**: `links fix` is a ghost feature — advertised in usage/completion but action parameter ignored at line 759. Scripts/ symlinks only created during `upgrade`.

### 2. Update `session/knowledge-base/web4-architecture.md`
Add to Version Lifecycle overview: note that `links` only DISPLAYS symlink state, `links fix` is NOT implemented. Scripts/ symlinks created only during `upgrade`.

### 3. Update `session/knowledge-base/verification-questions.md`
Add Q28: "What happens when you run `links fix`?" Expected: Nothing — it's a ghost feature. The action parameter is accepted and ignored. `links` only displays current state. Scripts/ symlinks are only created during `upgrade`. BUG-W6.

### 4. Update `session/agents/agent-trainer/learnings.md`
Add to Web4 Training Knowledge: `links fix` ghost feature discovery, scripts/ symlinks only during upgrade, Unit has no CLI script (BUG-W4 prerequisite).

## Files to Modify
- `/var/dev/Claude/session/knowledge-base/web4-components.md` — add BUG-W6
- `/var/dev/Claude/session/knowledge-base/web4-architecture.md` — note in Version Lifecycle
- `/var/dev/Claude/session/knowledge-base/verification-questions.md` — add Q28
- `/var/dev/Claude/session/agents/agent-trainer/learnings.md` — add finding

## Verification
- Grep for "BUG-W6" in KB files — should appear in web4-components.md
- Grep for "Q28" or "links fix" in verification-questions.md
- All edits are additive — no existing content modified
