# Iteration 3 Task 7: Refactor Dev Container Startup Workflow

## Background
Current dev container startup scripts are being consolidated into a single orchestrator script for deterministic, race-free startup and easier maintenance.

## Requirements
- Create a single orchestrator script (e.g., `devcontainer-up.sh`) to handle all container lifecycle steps.
- Update `package.json` to use the new script for `npm start`.
- Remove redundant scripts and update documentation.

## Acceptance Criteria
- Only one script is needed to build/start the dev container.
- No race conditions or status check issues.
- Documentation is updated.

---

**References:**
- [devops/iteration-refactor-devcontainer.md](../../devops/iteration-refactor-devcontainer.md)
- [devops/devops-scripts-journey.md](../../devops/devops-scripts-journey.md)
# Sprint 3 Task 3: DevOps - Project Directory Structure and Sync

**Date:** 2025-07-22

## Task Description
- Ensure the project directory inside the dev container matches the expected path (`/home/shared/workspace/UpDown`).
- Fix the current project folder location if it is `/workspace/.` instead of the correct directory.
- Make the workspace directory a real directory (not just a mount or overlay) and ensure it can be synced to the outside host directory.
- Implement an `npm` script (e.g., `npm run sync:workspace`) to sync the workspace directory between the container and the host using the provided executable script (`devops/sync-workspace-to-host.sh`).
- Ensure the sync script is executable (`chmod +x devops/sync-workspace-to-host.sh`).
- Document the directory structure and sync process in the onboarding documentation.

## Acceptance Criteria
- Project directory is at `/home/shared/workspace/UpDown` inside the container.
- Workspace directory is a real directory and can be synced to the outside host.
- `npm run sync:workspace` script is available and documented.
- Onboarding documentation is updated to reflect the new structure and sync process.

## References
- [Sprint 3 User Prompts and Requirements](./user-prompts.md)
- [Sprint 3 Outline](./outline.md)
- [devops/ directory](../../devops/)

---

This file documents the third DevOps task for Sprint 3. All changes must be referenced here and in the onboarding documentation.
