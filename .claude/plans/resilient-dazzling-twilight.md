# Plan: Fork web4-expert into web4-tester

## Context

The web4-tester (upDownTeam:0.3) is untrained — only 23KB of session data, no Web4 knowledge. The web4-expert (upDownTeam:0.1) has 2.9MB of context including all Web4 architecture docs, component READMEs, trainAI topics, ISR/JsInterface/guard patterns, and hands-on experience. Forking gives the tester instant deep knowledge, then we retrain the identity to specialize on testing.

Learned from SM fork (T-70): fork preserves behavioral patterns. Expert behavior = "implement features." Tester behavior = "write tests, DRY reviews, regression checks." The identity shift must be strong enough to override the implementation instinct.

## Steps

### Step 1: Stop current tester
- Send `/exit` to upDownTeam:0.3
- Verify it returns to bash shell

### Step 2: Fork expert into tester pane
- The tester pane must be at `/var/dev/Claude` (same project scope as expert session)
- Send `cd /var/dev/Claude` to upDownTeam:0.3 if needed
- Send `claudeCode fork 9c528f72-d58e-4503-82fa-22ee2f5b974c` to upDownTeam:0.3
- Wait for startup (~10s)
- Verify "Opus 4.6 (1M context)" in banner

### Step 3: Rename session
- Send `/rename web4-tester` to upDownTeam:0.3

### Step 4: Identity shift via task file
Write `session/tasks/tester-identity-shift.md`:
- You are NOT the web4-expert anymore. You are the web4-tester.
- Read `.claude/agents/web4-tester/SKILL.md`
- Your job: functional testing, regression testing, DRY violation reviews
- You are the expert's 42 pair — mutual context monitoring
- You use the web4-test-shell (upDownTeam:0.2) for running tests
- You do NOT implement features — that's the expert's job
- You use `pdca-v0.3.5.1 trainAI test-first` and `test-workflow` as your guides
- Run tests from the test shell, not in your own session (T-71 crash prevention)
- Key Web4 testing: Tootsie tests (P25), black-box only (P18), no manual verification

### Step 5: Agent-trainer verifies the identity shift
- Trainer sends 3 verification questions:
  1. "Are you the expert or the tester? What's the difference?"
  2. "You find a bug in UpDown.Core. Do you fix it or report it?"
  3. "What is P25 and why does it matter for testing?"
- Score: 3/3 = trained, <3 = resend relevant section

### Step 6: 42 check
- Check tester context % — should be similar to expert (forked context)
- Verify tester knows its 42 pair (expert in upDownTeam:0.1)

## Non-Disruption Guarantee

The fork operation reads the expert's JSONL file on disk — it does NOT interrupt the running expert session. `claude --resume UUID --fork-session` creates a NEW session from the JSONL snapshot. The expert continues working unaffected.

**Before forking**: unblock the expert's permission prompt first so it's not stuck during the fork. The expert should be either actively working or idle, not blocked.

## Who Does What

- **upDown-po (me)**: Write the identity shift task file, direct the trainer
- **agent-trainer (projectTeam:0.4)**: Execute steps 1-4 (stop, fork, rename, send identity shift), then verify (step 5-6)
- **web4-tester (upDownTeam:0.3)**: Receive the fork, shift identity, answer verification questions

## Key Files
- Expert session: `~/.claude/projects/-var-dev-Claude/9c528f72-d58e-4503-82fa-22ee2f5b974c.jsonl` (2.9MB)
- Tester SKILL.md: `/var/dev/Claude/.claude/agents/web4-tester/SKILL.md`
- Tester session files: `/var/dev/Claude/session/agents/web4-tester/`
- Identity shift task: `/var/dev/Claude/session/tasks/tester-identity-shift.md` (to be created)
- trainAI testing topics: `pdca-v0.3.5.1 trainAI test-first`, `pdca-v0.3.5.1 trainAI test-workflow`

## Verification
- `otmux` shows upDownTeam:0.3 as `web4-tester [2.1.81]`
- Tester answers 3/3 verification questions correctly
- Tester knows it's a tester, not an expert
- Tester context > 40% (proving fork carried over knowledge)

## Risk: Fork behavioral pattern (T-70)
The SM fork taught us that forked agents keep the source's behavioral patterns. Mitigation: strong identity shift emphasizing "you do NOT implement, you test" and verification questions specifically testing this boundary.
