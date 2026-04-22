# Plan: Test hiveMind team.pull & agent.restart (remote offloading)

## Context

UpDown.ai is memory-overloaded. Need to offload agents to MacStudio.native. Existing `agent.restart.remote` pushes TO remote. New features pull FROM remote:
- `hiveMind team.pull <ssh-config-name>` — SSH into remote, download team config into `hivemind.<name>/`
- `hiveMind agent.restart <remote-config-dir>` — start agents locally from pulled config

Expert implements, I write tests first (TDD). Task file: `/var/dev/Claude/session/tasks/hivemind-remote-pull.md`

## Critical Files

| File | Role |
|------|------|
| `/root/oosh/hiveMind` | Implementation — add team.pull + agent.restart near line 1815 |
| `/root/oosh/test/test.hiveMind` | Tests — append before cleanup block (~line 3100) |
| `/root/oosh/ossh` | SSH transport — `ossh pull.dir`, `ossh exec` |
| `/root/oosh/test/test.ossh` | Reference: SSH mocking with mktemp + CURRENT_SSH_DIR |

## Reuse Existing Patterns

- **Snapshot format**: `session|address|role|uuid|title` (from `teams.save` line 1655)
- **Restore logic**: `teams.restore` line 1723 — `private.hiveMind.ensure.pane`, `claudeCode fork $uuid`
- **Remote exec**: `ossh exec "$host"` + `ossh pull.dir` (ossh lines 1212-1268)
- **SSH completion**: `grep '^Host ' ~/.ssh/config | awk '{print $2}'` (line 3082)
- **Test fixtures**: Heredoc snapshots in /tmp, `__test_` prefix, `$$` isolation (T-RESTORE pattern)
- **Cleanup**: `grep -v '__test_'` registry filter, `otmux kill`, `rm -rf` temp dirs

## Test Plan: 16 Test Cases

### Shared Setup

```bash
TEST_PULL_HOST="mock-remote-$$"
TEST_PULL_DIR="/tmp/hivemind.${TEST_PULL_HOST}"
TEST_ARESTART_SESS="__test_arestart_$$"

# Mock SSH config (same pattern as test.ossh lines 97-166)
TEST_SSH_DIR=$(mktemp -d /tmp/__test_sshdir_$$.XXXXXX)
cat > "$TEST_SSH_DIR/config" <<EOF
Host mock-remote-$$
  HostName 192.168.99.99
Host mock-gateway-$$
  HostName 10.0.0.1
EOF
ORIG_SSH_DIR="${CURRENT_SSH_DIR:-}"
export CURRENT_SSH_DIR="$TEST_SSH_DIR"
```

### A. team.pull (T-PULL-1..7)

| ID | Test | Assert |
|----|------|--------|
| T-PULL-1 | `type -t hiveMind.team.pull` | function exists |
| T-PULL-2 | `hiveMind.team.pull.completion.host` | returns mock SSH hosts |
| T-PULL-3 | `hiveMind.team.pull` (no args) | returns non-zero |
| T-PULL-4 | `hiveMind.team.pull nonexistent-host-$$` | returns non-zero, no hang (timeout 10s) |
| T-PULL-5 | After mocked pull: check `hivemind.<name>/` | directory exists with snapshot + roles files |
| T-PULL-6 | Snapshot file in pulled dir | has header, pipe-delimited, 5 fields per line |
| T-PULL-7 | Pull again (idempotent) | succeeds, no corruption |

**Note on T-PULL-5..7**: Since we can't SSH to a mock host, create the fixture directory manually (simulating what team.pull would produce), then test the parsing/validation logic. Mark SSH-dependent tests as SKIP when no real host available.

### B. agent.restart (T-ARESTART-1..7)

| ID | Test | Assert |
|----|------|--------|
| T-ARESTART-1 | `type -t hiveMind.agent.restart` | function exists |
| T-ARESTART-2 | `hiveMind.agent.restart.completion.configDir` | returns `hivemind.*` dirs |
| T-ARESTART-3 | `hiveMind.agent.restart` (no args) | returns non-zero |
| T-ARESTART-4 | `hiveMind.agent.restart hivemind.nonexistent_$$` | returns non-zero |
| T-ARESTART-5 | `hiveMind.agent.restart /tmp/hivemind.empty_$$` (empty dir) | returns non-zero |
| T-ARESTART-6 | Restart from fixture dir with 2-agent snapshot (no UUIDs) | session created, 2 panes, registry populated |
| T-ARESTART-7 | Restart with existing session name | handles collision (rename or error, not silent fail) |

**T-ARESTART-6 setup**: Create fixture dir with mock snapshot (heredoc, no UUIDs so claudeCode fork not called). Verify session + panes + registry. Gate behind `otmux sessions` check.

### C. Integration (T-PULLRESTART-1..2)

| ID | Test | Assert |
|----|------|--------|
| T-PULLRESTART-1 | Round-trip: create fixture pull dir → agent.restart | session + panes + registry + titles correct |
| T-PULLRESTART-2 | `agent.restart.remote` still exists | function + completions not clobbered |

### Cleanup

```bash
# In-section cleanup after each test group
otmux kill "$TEST_ARESTART_SESS" 2>/dev/null
rm -rf "$TEST_PULL_DIR" /tmp/hivemind.mock-* /tmp/hivemind.empty_* /tmp/hivemind.roundtrip-*
rm -rf "$TEST_SSH_DIR"
export CURRENT_SSH_DIR="$ORIG_SSH_DIR"
# Registry: grep -v '__test_arestart\|__test_pull' pattern
```

## Implementation Steps

1. Write all 16 test cases in `test/test.hiveMind` before cleanup block
2. Run tests — all T-PULL-1, T-ARESTART-1 will FAIL (functions don't exist yet)
3. Send test expectations to expert
4. Expert implements `team.pull` + `agent.restart` in hiveMind
5. Re-run tests — iterate until all pass
6. Commit tests, push

## Verification

```bash
# Run from oosh-tester-shell (projectTeam:0.5)
otmux send projectTeam:0.5 'test.suite run hiveMind 1' Enter
# Check results
otmux pane.history projectTeam:0.5 | grep 'T-PULL\|T-ARESTART\|T-PULLRESTART'
# Verify zero stale artifacts
grep '__test_arestart\|__test_pull' ~/config/hivemind.*.env
ls /tmp/hivemind.mock-* /tmp/hivemind.empty_* 2>/dev/null
```
