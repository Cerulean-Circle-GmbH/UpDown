
[Back to Planning](./planning.md)

# Iteration-3-Task-5 Enable GitHub SSH Access from Dev Container

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
- Ensure that developers can commit and push to GitHub from inside the dev container. Diagnose and resolve SSH key and permission issues (e.g., `Permission denied (publickey)` when using `git@github.com`). Provide a script (`devops/copy-ssh-key-to-container.sh`) to copy SSH keys from the host into the container and set correct permissions. Document the steps for setting up SSH keys and GitHub access in the onboarding documentation.

## Context
- Developers have encountered SSH key and permission issues when pushing to GitHub from inside the dev container. QA audit identified the need for a documented, maintainable solution.

## Intention
- Ensure all developers can commit and push to GitHub from inside the dev container, with clear onboarding and troubleshooting steps.

## Steps
- [x] Diagnose SSH key and permission issues.
- [x] Provide script to copy SSH keys and set permissions.
- [ ] Document setup and troubleshooting steps in onboarding docs.
- [ ] Assign to QA for verification and feedback.

## Requirements
- Developers must be able to commit and push to GitHub from inside the dev container.
- SSH key setup and troubleshooting steps must be documented for onboarding.
- The script must be available and referenced in onboarding docs.

## Tech Stack Rationale
- Use bash scripts for SSH key management to ensure compatibility and maintainability. Document all steps for onboarding clarity.

## Acceptance Criteria
- Developers can successfully commit and push to GitHub from inside the dev container.
- SSH key setup and troubleshooting steps are documented for onboarding.
- The script is available and referenced in onboarding docs.

## QA Audit & User Feedback
- 2025-07-31 UTC: QA audit identified the need for documented SSH key setup and troubleshooting. All changes must be referenced in the QA audit file for this iteration.

## Dependencies
- [Iteration 3 Task 2: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-2.md)
- [Iteration 3 Task 4: Robust Container and Local Workflow](./iteration-3-task-4.md)

## Subtasks
- [Iteration-3-Task-5.1 DevOps: Implements SSH Access](./iteration-3-task-5.1-devops-implements-ssh-access.md)

[Back to Planning](./planning.md)
