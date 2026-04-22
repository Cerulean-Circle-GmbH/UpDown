# Test Plan: upDown.deployKey SSH Identity

## Context

PO (Tron) needs a new SSH deploy key identity `upDown.deployKey` for pushing to the Web4AI repo. The expert implements via `myId.create.github.deploy.key`; I (oosh-tester) verify results and review code quality. Expert is in projectTeam:0.1 — wait for their signal before running functional tests.

## Key Files

| File | Role |
|------|------|
| `/root/oosh/test/test.myId` | **Test file to write** (currently 44-line scaffold) |
| `/root/oosh/myId` lines 40-81 | Function under test |
| `/root/oosh/ossh` lines 197-221 | `ossh.id.create` (creates ed25519 key) |
| `/root/oosh/ossh` lines 223-279 | `ossh.config.create` (creates SSH Host entry) |
| `/root/oosh/ossh` lines 129-149 | `ossh.get.public.id` (prints public key) |
| `~/.ssh/config` | SSH config (currently has `Host github.com` → cerulean.githubCC) |
| `~/.ssh/ids/` | Identity storage (currently has `cerulean.githubCC/`) |

## Call Chain (naming asymmetry documented)

```
myId.create.github.deploy.key github-web4x git@github.com:web4x/Web4AI.git upDown.deployKey
  → ossh id.create "upDown.deployKey.github-web4x"           # idName.sshConfigName order
  → ossh config.create "github-web4x.upDown.deployKey" ...   # sshConfigName.idName order (reversed!)
  → ossh get.public.id "upDown.deployKey.github-web4x"       # idName.sshConfigName order
```

Identity dir: `~/.ssh/ids/upDown.deployKey.github-web4x/`
SSH Host alias: `github-web4x.upDown.deployKey`

## Test Plan — 3 Phases, ~20 assertions

### Phase 1: Pre-Implementation (run NOW)

| Test | What | How |
|------|------|-----|
| P1 | Baseline: capture existing state | Snapshot `~/.ssh/ids/` and `~/.ssh/config` |
| P2a | Missing all 3 params → error | `myId.create.github.deploy.key` with no args → return 1 |
| P2b | Missing 2 params → error | 1 arg only → return 1 |
| P2c | Missing 1 param → error | 2 args only → return 1 |
| MC3 | Completion stub `myId.parameter.completion.id` exists | `declare -f` check |
| MC4 | Error message mentions "sshConfigName" | Capture stderr, grep |

### Phase 2: Post-Implementation Functional (after expert signals DONE)

| Test | What | How |
|------|------|-----|
| T1 | `myId list` shows new identity | grep output for `upDown.deployKey.github-web4x` |
| T2a | Identity directory exists | `[ -d ~/.ssh/ids/upDown.deployKey.github-web4x ]` |
| T2b | `id_ed25519` private key exists | `[ -f .../id_ed25519 ]` |
| T2c | `id_ed25519.pub` public key exists | `[ -f .../id_ed25519.pub ]` |
| T2d | `private_key/` subfolder copy exists | `[ -f .../private_key/*.private_key ]` |
| T2e | `public_keys/` subfolder copy exists | `[ -f .../public_keys/*.public_key ]` |
| T3 | Key is ed25519 (not RSA) | `head` pub key, grep `ssh-ed25519` |
| T4a | SSH config has Host entry | grep `~/.ssh/config` for Host alias |
| T4b | IdentityFile references new key | awk config block, grep identity path |
| T5 | `ossh get.public.id` prints key | Call function, grep output for `ssh-ed25519` |
| R1 | `cerulean.githubCC` dir still exists | `[ -d ]` check |
| R2 | Original RSA key intact | `[ -f .../id_rsa ]` |
| R3 | `Host github.com` still in config | grep check |
| R4 | `Host github.com` still references cerulean | awk block, grep |

### Phase 3: DRY Review (T6 — code review, report only)

| Finding | Location | Action |
|---------|----------|--------|
| DRY-1 | `ossh.id.create` (lines 216-221) and `ossh.id.create.fromKey` (lines 186-194) share identical folder-creation + copy logic | Report to Task Agent |
| DRY-2 | `myId.create.github.deploy.key` line 40 has empty doc comment `# ` — naming asymmetry undocumented | Report to Task Agent |
| DRY-3 | `cd "$gitHubFolder"` on line 70 changes caller's CWD as side effect — should use subshell | Report to Task Agent |
| QUALITY-1 | No completion stubs for `create.github.deploy.key` params (sshConfigName, githubUrl, idName) | Report to Task Agent |

## Test File Structure

```bash
#!/usr/bin/env bash
source this
source test.suite
level=$1; [ -z "$level" ] && level=1
log.level $level
source $OOSH_DIR/myId
source $OOSH_DIR/ossh

# --- Phase 1: Pre-implementation ---
# P1: Baseline snapshot
# P2a-c: Missing param error tests (test.case.expect.error)
# MC3: Completion stub check
# MC4: Human-readable error check

# --- Phase 2: Post-implementation (guarded by identity dir existence) ---
ID_DIR="$HOME/.ssh/ids/upDown.deployKey.github-web4x"
if [ -d "$ID_DIR" ]; then
  # T1-T5: Functional tests
  # R1-R4: Regression tests
else
  echo "SKIPPED: identity not yet created (waiting for expert)"
fi

test.suite.save.results
```

## Verification

1. Run Phase 1 tests immediately: `./test.suite run myId 1`
2. After expert signals completion, run full suite: `./test.suite run myId 1`
3. Report T1-T5, R1-R4 results to expert and PO
4. File DRY findings with Task Agent separately

## Risk: ssh-keygen interactivity

`ossh.id.create` calls `ssh-keygen -t ed25519 -f <path>` (line 214) which prompts for passphrase. Expert must pass `-N ""` for non-interactive execution. If tests hang, this is the cause.
