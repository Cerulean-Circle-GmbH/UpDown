# Plan: hiveMind team.pull & agent.restart (remote offloading)

## Context

UpDown.ai is memory-overloaded. Need to pull agent configs FROM remote and restart locally on MacStudio.native. Existing `teams.migrate` pushes TO remote — we need the reverse. Existing `agent.restart.remote` pushes one agent — we need bulk pull + local restart.

## Method 1: `hiveMind.team.pull <sshConfigName>`

Pull all agent configs from a remote machine into a local directory.

**Signature**: `hiveMind.team.pull() # <sshConfigName> # pull team config from remote machine`

**Flow**:
1. Open SSH connection: `ossh connection.open "$host"`
2. Run remote `hiveMind teams.save` to create fresh snapshot:
   `ossh exec "$host" "hiveMind teams.save"`
3. Create local config dir: `~/config/hivemind.pull.$host/`
4. Pull snapshot file: `ossh pull.dir "$host" "config/hivemind.snapshot.*.env"` → pick latest
5. Pull remote config files:
   - `scp "$host:~/config/hivemind.roles.env" "$pullDir/roles.env"`
   - `scp "$host:~/config/hivemind.sessions.env" "$pullDir/sessions.env"`
   - `scp "$host:~/config/hivemind.teams.env" "$pullDir/teams.env"`
6. Pull JSONL files for each UUID in snapshot:
   - Parse snapshot, extract UUIDs
   - For each UUID: find JSONL path on remote, `scp` to local `~/.claude/projects/` (same path structure)
7. Copy snapshot into pull dir as `snapshot.env`
8. Print summary: N agents pulled, N JONSLs transferred

**Config directory structure**:
```
~/config/hivemind.pull.UpDown.ai/
├── snapshot.env          # team snapshot (session|addr|role|uuid|title)
├── roles.env             # registry copy
├── sessions.env          # UUID mapping copy
├── teams.env             # team list copy
└── pulled.timestamp      # when the pull happened
```

**Completion**: `hiveMind.team.pull.completion.sshConfigName()` → `private.ossh.config.complete.hosts` (reuse ossh pattern)

## Method 2: `hiveMind.agent.restart <pullDir>`

Restart agents locally from a pulled config directory.

**Signature**: `hiveMind.agent.restart() # <pullDir> # restart agents from pulled config`

**Flow**:
1. Read `$pullDir/snapshot.env` for agent list
2. For each agent with a UUID:
   a. Check JSONL exists locally: `~/.claude/projects/*/$uuid.jsonl`
   b. Create tmux session if needed: `otmux new "$session"`
   c. Create pane: `private.hiveMind.ensure.pane "$session:$addr"`
   d. Set pane title + registry: `private.hiveMind.pane.identify "$pane" "$role"`
   e. Start Claude: `otmux send.enter "$pane" "claudeCode opus"`
   f. Wait, then fork session: `otmux send.enter "$pane" "claudeCode fork $uuid"`
   g. Send boot prompt if available
3. Register team: `hiveMind.team.register "$session" "Pulled from $host"`
4. Print summary

**Session naming**: Use original session names from snapshot. If collision, prefix with host name (e.g. `UpDown.ai.projectTeam`).

**Completion**: `hiveMind.agent.restart.completion.pullDir()` → `ls -d ~/config/hivemind.pull.*/`

## Key File

`/root/oosh/hiveMind` — add both methods + completions

## Reused Patterns

| Pattern | Source | Used For |
|---------|--------|----------|
| `ossh connection.open` | ossh | Persistent SSH |
| `ossh exec` | ossh | Remote commands |
| `scp` | direct | File transfer |
| `private.hiveMind.ensure.pane` | hiveMind | Create sessions/panes |
| `private.hiveMind.pane.identify` | hiveMind | Set title + registry |
| `hiveMind.team.register` | hiveMind | Register pulled team |
| `private.ossh.config.complete.hosts` | ossh | SSH host completion |
| Snapshot format | teams.save | Same pipe-delimited format |

## Verification

1. `hiveMind team.pull UpDown.ai` — creates `~/config/hivemind.pull.UpDown.ai/` with snapshot + configs
2. `hiveMind agent.restart hivemind.pull.UpDown.ai` — starts agents locally with forked sessions
3. `hiveMind team.status` — shows pulled team alongside local teams
4. Tab completion works for both commands
5. Existing `agent.restart.remote` (push) unchanged
