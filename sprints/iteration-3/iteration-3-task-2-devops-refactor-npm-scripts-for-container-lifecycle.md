[Back to Planning](./planning.md)

# Iteration-3-Task-2 DevOps: Refactor NPM Scripts for Container Lifecycle

**Date:** 2025-07-22

## Task Description
- Refactor npm scripts so that npm start (on host) only manages the dev container lifecycle (build, start, stop, status).
- Add scripts or documentation for attaching to the running dev container (e.g., docker exec -it, VS Code Remote Containers).
- Remove or clarify any npm scripts that attempt to run bun or server/client code directly on the host.
- Ensure all bun/server/client commands are run inside the dev container.

## Acceptance Criteria
- npm start and related scripts only manage the dev container lifecycle.
- Developers have clear instructions/scripts for attaching to the dev container and running bun/server/client inside.

## Dependencies
- [Iteration 3 Task 1: Document Containerized Developer Workflow](./iteration-3-task-1.md)

## Next Step
- Assign to PO for onboarding and documentation updates.

---
## Subtasks
- [Iteration-3-Task-2.1 DevOps: Enable GitHub SSH Access from Dev Container](./iteration-3-task-2.1-devops-enable-github-ssh-access-from-dev-container.md)
