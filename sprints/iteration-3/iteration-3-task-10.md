# Sprint 3 Task 10: DevOps - Project Directory Structure and Sync

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

## Dependencies
- [Iteration 3 Task 2: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-2.md)
- [Iteration 3 Task 4: Robust Container and Local Workflow](./iteration-3-task-4.md)

---

This file documents the third DevOps task for Sprint 3. All changes must be referenced here and in the onboarding documentation.
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

## Dependencies
- [Iteration 3 Task 2: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-2.md)
- [Iteration 3 Task 4: Robust Container and Local Workflow](./iteration-3-task-4.md)

---

This file documents the third DevOps task for Sprint 3. All changes must be referenced here and in the onboarding documentation.
