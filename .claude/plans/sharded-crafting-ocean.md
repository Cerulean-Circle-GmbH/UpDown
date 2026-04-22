# Plan: Boot 6-Agent Team Session

## Context

Tron wants a full team session with 6 agents: orchestrator, oosh-expert, oosh-tester, scrum-master, agent-trainer, woda-writer. No existing `hiveMind team.setup.*` supports 6 agents. We execute via root-oosh shell (po:0.2) so Tron can observe.

## Bugs Discovered (backlog, not fixing now)

1. **otmux.new always attaches** — no way to create detached session. Needs `otmux.new.detached` or smart detection when $TMUX is set.
2. **otmux.split.v/h have no `<target>` parameter** — caller must use raw `-t` flag to target a remote pane. The method should accept `<?target>` positionally.
3. **otmux.pane.lock `-p` bug** — `set-hook -p` unsupported on Linux tmux.
4. **hiveMind team.setup uses `--dangerously-skip-permissions`** — banned by governance.
5. **hiveMind team.setup uses raw flags** (`-d`, `-t`) passed to OOSH wrappers.

## Strategy: Work From Inside the Target Session

Since split methods can't target remote sessions without flags, we work from INSIDE the new session:

1. Create session — `otmux new` from root-oosh will error on attach but session gets created
2. Send ALL setup commands INTO the new session's pane 0.0 — splits happen locally in that session, no `-t` needed
3. Set titles and start agents

## Target Layout

```
┌──────────────┬──────────────┐
│ orchestrator │ oosh-expert  │
├──────────────┼──────────────┤
│ scrum-master │ oosh-tester  │
├──────────────┼──────────────┤
│ agent-trainer│ woda-writer  │
└──────────────┴──────────────┘
```

## Execution Steps

All commands sent from PO (me) to project-shell (po:0.1) using `otmux send po:0.1 "..." Enter`. The project-shell executes commands and sends setup commands into the new session.

### Step 1: Create session
```bash
# From root-oosh — will error on attach, but session gets created
otmux new projectTeam
```
Verify: `otmux has projectTeam`

### Step 2: Split panes from inside projectTeam:0.0

Send split commands TO projectTeam:0.0 — they execute in that pane's context, splitting locally:
```bash
otmux send projectTeam:0.0 "otmux split.v" Enter
otmux send projectTeam:0.0 "otmux split.v" Enter
otmux send projectTeam:0.0 "otmux split.h" Enter
```

Wait — this requires oosh to be available in projectTeam's shell. The new session's shell needs OOSH on PATH.

**Alternative**: Use the root-oosh shell's `otmux send` to send raw split commands. But otmux.send sends keys to a pane — we can send `otmux split.v` as a command to execute in that pane.

**Problem**: After the first split.v, pane 0.0 is now smaller. The second split.v and split.h need to target specific panes. But from inside 0.0, `otmux split.v` splits the CURRENT pane (0.0), not others.

### Revised Step 2: Sequential splits with tiled layout

Actually, from the root-oosh shell we can use `otmux send` to target any pane in projectTeam. The pane receives the text and executes it. But `otmux split.v` without a target splits the pane that runs the command.

Simplest approach — just split 0.0 five times, then tile:
```bash
# Each split creates a new pane by splitting the current 0.0
otmux send projectTeam:0.0 "otmux split.v" Enter
# wait
otmux send projectTeam:0.0 "otmux split.v" Enter
# wait
otmux send projectTeam:0.0 "otmux split.v" Enter
# wait
otmux send projectTeam:0.0 "otmux split.v" Enter
# wait
otmux send projectTeam:0.0 "otmux split.v" Enter
# wait
# Now tile to arrange evenly
otmux send projectTeam:0.0 "otmux tiled" Enter
```

This gives 6 panes (0.0 through 0.5) in a tiled 3x2 grid. Each split.v runs inside 0.0's shell, splitting IT — no target flag needed.

**Prerequisite**: oosh must be on PATH in the new session's shell. If not, we send `source ~/.bashrc` first.

### Step 3: Set pane titles

Verify pane count and numbering first:
```bash
otmux pane.capture projectTeam:0.0 5
```

Then set titles from root-oosh shell:
```bash
otmux pane.title projectTeam:0.0 orchestrator
otmux pane.title projectTeam:0.1 scrum-master
otmux pane.title projectTeam:0.2 agent-trainer
otmux pane.title projectTeam:0.3 oosh-expert
otmux pane.title projectTeam:0.4 oosh-tester
otmux pane.title projectTeam:0.5 woda-writer
```

### Step 4: Start Claude Code (Opus 1M) in each pane

`claudeCode opus` starts Claude Code with `--model opus` = Opus 4.6 with 1M context.
`claudeCode new` would use the default model (may not be 1M).

```bash
otmux send projectTeam:0.0 "claudeCode opus" Enter
# wait 8s
otmux send projectTeam:0.1 "claudeCode opus" Enter
# ... repeat for each, with waits
```

### Step 5: Bootstrap roles
```bash
otmux send projectTeam:0.0 "/rename orchestrator" Enter
otmux send projectTeam:0.1 "/rename scrum-master" Enter
# ... etc
# Then send role prompts:
otmux send projectTeam:0.0 "Read .claude/agents/agent-teacher/SKILL.md" Enter
# ... etc
```

### Step 6: Verify
```bash
otmux                              # full tree
otmux tree.detailed                # with UUIDs
```

## Verification Criteria

- `otmux` shows projectTeam session with 6 panes
- Each pane has correct title (role name)
- Each pane has Claude Code running
- `otmux tree.detailed` shows 6 Claude session UUIDs

## Risk: OOSH not on PATH in new session

If the new session's shell doesn't have oosh on PATH, `otmux split.v` won't work inside projectTeam:0.0. Mitigation: send `source ~/.bashrc` first, or use the full path to otmux.
