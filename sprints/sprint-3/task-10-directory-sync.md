
[Back to Planning](./planning.md)

# Iteration 3 Task 10: DevOps - Project Directory Structure and Sync

## Status
- [x] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Task Description
- Ensure the project directory inside the dev container matches the expected path (`/home/shared/workspace/UpDown`). Fix the current project folder location if it is `/workspace/.` instead of the correct directory. Make the workspace directory a real directory (not just a mount or overlay) and ensure it can be synced to the outside host directory. Implement an `npm` script (e.g., `npm run sync:workspace`) to sync the workspace directory between the container and the host using the provided executable script (`devops/sync-workspace-to-host.sh`). Ensure the sync script is executable (`chmod +x devops/sync-workspace-to-host.sh`). Document the directory structure and sync process in the onboarding documentation.

## Context
- The project directory structure and sync process must be clear and reproducible for all developers. QA audit identified issues with directory location and sync reliability.

## Intention
- Ensure the project directory is correctly located and can be reliably synced between container and host, with clear onboarding documentation.

## Steps
- [x] Fix project directory location inside dev container.
- [x] Make workspace directory a real directory.
- [x] Implement and document sync script.
- [ ] Assign to QA for verification and feedback.

## Requirements
- Project directory must be at `/home/shared/workspace/UpDown` inside the container.
- Workspace directory must be a real directory and can be synced to the outside host.
- `npm run sync:workspace` script must be available and documented.
- Onboarding documentation must be updated to reflect the new structure and sync process.

## Tech Stack Rationale
- Use bash scripts and npm scripts for directory management and sync. Document all steps for onboarding clarity.

## Acceptance Criteria
- Project directory is at `/home/shared/workspace/UpDown` inside the container.
- Workspace directory is a real directory and can be synced to the outside host.
- `npm run sync:workspace` script is available and documented.
- Onboarding documentation is updated to reflect the new structure and sync process.

## QA Audit & User Feedback
- 2025-07-31 UTC: QA audit identified the need for clear directory structure and sync documentation. All changes must be referenced in the QA audit file for this iteration.

## Dependencies
- [Iteration 3 Task 2: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-2.md)
- [Iteration 3 Task 4: Robust Container and Local Workflow](./iteration-3-task-4.md)

## Subtasks

**References:**
- [Sprint 3 User Prompts and Requirements](./user-prompts.md)
- [devops/devops-scripts-journey.md](../../devops/devops-scripts-journey.md)
- [devops/iteration-refactor-devcontainer.md](../../devops/iteration-refactor-devcontainer.md)

[Back to Planning](./planning.md)
