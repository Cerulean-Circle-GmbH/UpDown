# Iteration-3-Task-2.1 DevOps: Enable GitHub SSH Access from Dev Container

**Date:** 2025-07-22

[Back to Main Task](./iteration-3-task-2-devops-refactor-npm-scripts-for-container-lifecycle.md)

## Task Description
- Ensure that developers can commit and push to GitHub from inside the dev container.
- Diagnose and resolve SSH key and permission issues (e.g., `Permission denied (publickey)` when using `git@github.com`).
- Provide a script (`devops/copy-ssh-key-to-container.sh`) to copy SSH keys from the host into the container and set correct permissions.
- Document the steps for setting up SSH keys and GitHub access in the onboarding documentation.

## Acceptance Criteria
- Developers can successfully commit and push to GitHub from inside the dev container.
- SSH key setup and troubleshooting steps are documented for onboarding.
- The script is available and referenced in onboarding docs.

## References
- [Sprint 3 User Prompts and Requirements](./user-prompts.md)
- [Sprint 3 Outline](./outline.md)
- [devops/ directory](../../devops/)

---

This file documents the second DevOps task for Sprint 3. All changes must be referenced here and in the onboarding documentation.
