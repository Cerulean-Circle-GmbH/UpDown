[Back to Main Task](./iteration-3-task-1-architect-document-containerized-developer-workflow.md)

# Iteration-3-Task-1.1 DevOps: Robust Container and Local Workflow

**Date:** 2025-07-22

## Task Description
- Refactor npm scripts and DevOps shell scripts to ensure the project can be bootstrapped, built, and started both inside and outside the dev container.
- The process must:
  - Detect if it is running inside a Docker container and if the correct Docker image is used.
  - Ensure that running `npm start` inside or outside the container always does the right thing (bootstraps, builds, and starts the container or the app as appropriate).
  - Run the SSH key copy script (`npm run copy:ssh-key`) as part of the start procedure, using the SSH key path provided by the `SSH_KEY_PATH` environment variable.
  - Capture all cases in the DevOps scripts for robust developer onboarding and workflow.
- Provide attach/exec instructions and document the workflow in the `devops` directory and onboarding docs.
- Ensure all DevOps shell scripts in `devops/` are executable (`chmod +x devops/*.sh`).

## Acceptance Criteria
- `npm start` works correctly in all environments (inside/outside dev container), including copying the SSH key if needed.
- Scripts are maintainable, documented, robust, and executable.
- Onboarding documentation is updated to reflect the new workflow and SSH key process.

## References
- [Sprint 3 User Prompts and Requirements](./user-prompts.md)
- [Sprint 3 Outline](./outline.md)
- [devops/ directory](../../devops/)

---

This file documents the first DevOps task for Sprint 3. All changes must be referenced here and in the onboarding documentation.
