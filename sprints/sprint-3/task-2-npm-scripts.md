
[Back to Planning](./planning.md)


# Iteration-3-Task-2 DevOps: Refactor NPM Scripts for Container Lifecycle


## Task Description
- PO: Refactor npm scripts so that npm start (on host) only manages the dev container lifecycle (build, start, stop, status). Add scripts or documentation for attaching to the running dev container. Remove or clarify any npm scripts that attempt to run bun or server/client code directly on the host. Ensure all bun/server/client commands are run inside the dev container.

## Status
- [x] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Context
- The current npm scripts mix container lifecycle management and direct host execution of bun/server/client code, causing confusion and onboarding issues.
- Developers need clear separation between container management and code execution inside the dev container.

## Intention
- Ensure container lifecycle management is modular, maintainable, and clear for onboarding.
- Guarantee all developer commands are run inside the dev container for consistency and reproducibility.

## Steps
- [x] Refactor npm start and related scripts to only manage the dev container lifecycle.
- [x] Add scripts or documentation for attaching to the running dev container.
- [ ] Remove or clarify any npm scripts that attempt to run bun or server/client code directly on the host.
- [ ] Ensure all bun/server/client commands are run inside the dev container.
- [ ] Assign to PO for onboarding and documentation updates.

## Requirements
- Scripts must be modular and maintainable.
- All dependencies must be installable via configuration scripts.
- The workflow must be reproducible and documented.

## Tech Stack Rationale
- Use modular bash scripts and npm scripts to separate concerns and improve maintainability.
- Ensure compatibility with the devcontainer environment and cross-platform support.

## Acceptance Criteria
- npm start and related scripts only manage the dev container lifecycle.
- Developers have clear instructions/scripts for attaching to the dev container and running bun/server/client inside.
- Documentation is updated to reflect the tech stack and workflow.

## QA Audit & User Feedback
- 2025-07-31 UTC: Task updated to match template. All requirements, dependencies, and references preserved. QA feedback and process improvements are traceable in the audit and task documentation.
- All changes to this file must be documented in the QA audit file for this iteration.
- Any batch renaming, headline updates, or navigation changes must be cross-referenced in planning.md and the QA audit.
- Manual corrections and missed tasks/subtasks should be listed in the QA audit and mitigated as described.
- Ensure all links and headlines match the planning and file naming conventions.

## Dependencies
- [Iteration 3 Task 1: Document Containerized Developer Workflow](./iteration-3-task-1.md)

## Subtasks
- [Iteration-3-Task-2.1 DevOps: Enable GitHub SSH Access from Dev Container](./iteration-3-task-2.1-devops-enable-github-ssh-access-from-dev-container.md)

---
