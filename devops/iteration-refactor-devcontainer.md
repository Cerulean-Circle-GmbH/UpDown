# DevOps Task: Refactor Dev Container Startup Workflow (Option 2)

## Context & How We Got Here

- The UpDown project uses a dev container for a consistent development environment, with SSH key and repo cloning automation.
- The original workflow used multiple npm scripts (`docker:allcheck`, `docker:run`, `docker:status`) chained in `npm start`.
- This led to race conditions: status checks could run before the container was fully started, causing false negatives.
- The `docker-run.sh` script was made more robust and verbose, but the multi-script npm approach remained fragile.
- We considered two main options: (1) add wait/retry logic, or (2) consolidate logic into a single orchestrator script for determinism and maintainability.
- Option 2 was chosen for long-term robustness and simplicity.

## Refactoring Plan (Option 2: Script Consolidation)

### Goal
- Replace the current multi-script npm workflow with a single orchestrator script (e.g., `devops/devcontainer-up.sh`) that handles all dev container lifecycle steps deterministically.

### Steps
1. **Create `devcontainer-up.sh`**
    - This script will:
      1. Clean up old containers/images if needed.
      2. Build the image if missing or outdated.
      3. Start the container if not running, or restart if needed.
      4. Wait for the container to be healthy/running (with retry logic).
      5. Print final status and useful debug info.
2. **Update `package.json`**
    - Replace the current `start` script with a single call to the new orchestrator script.
      ```json
      "start": "bash ./devops/devcontainer-up.sh"
      ```
3. **Remove Redundant Scripts**
    - Deprecate or remove `docker:allcheck`, `docker:run`, `docker:status` npm scripts if no longer needed.
    - Keep only the orchestrator and any scripts needed for manual/advanced use.
4. **Documentation**
    - Update `README.md` and internal docs to reflect the new, single-command workflow.
    - Document the orchestrator script's logic and troubleshooting steps.

### Benefits
- Deterministic, race-free startup: all logic in one place, no npm chaining issues.
- Easier to debug and maintain: one script to rule them all.
- Clearer onboarding for new developers: just run `npm start` (or the orchestrator directly).

---

**Summary:**
We reached this point after repeated issues with race conditions and container state detection in a multi-script npm workflow. The recommended refactor is to consolidate all dev container lifecycle logic into a single orchestrator script, ensuring a robust, deterministic, and maintainable developer experience.
