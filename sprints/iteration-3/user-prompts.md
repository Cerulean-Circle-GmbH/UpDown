# Sprint 3 Tasks - Product Owner (PO)

**Date:** 2025-07-22

## Planning Phase
- Based on the Sprint 2 retro and process improvements, the PO assigns the following tasks to each role for Sprint 3.
- Each task must produce a concrete artifact (code, documentation, or specification) and reference the relevant process or retro learning.

---

### Scrum Master
- Summarize Sprint 2 retro and process changes for all roles.
- Ensure all roles are aware of the new process and artifact requirements.
- Keep `daily.md` and `project.outline.md` up to date after every major step.

### Architect
- Review and update the containerized developer workflow documentation ([docs/container-workflow.md](../../docs/container-workflow.md)).
- Ensure all architectural artifacts are created and referenced in the relevant files.

### DevOps
- Refactor npm scripts for container lifecycle and provide attach/exec instructions ([devops/](../../devops/)).
- Ensure all scripts are maintainable and documented in the `devops` directory.
- Ensure that the project can be bootstrapped, built, and started both inside and outside the dev container. The process must:
  - Detect if it is running inside a Docker container and if the correct Docker image is used.
  - Ensure that running `npm start` inside or outside the container always does the right thing (bootstraps, builds, and starts the container or the app as appropriate).
  - Capture all cases in the DevOps scripts for robust developer onboarding and workflow.

### Developer
- Begin producing implementation artifacts for assigned tasks as soon as DevOps and PO complete their steps.
- Ensure all code is modular, maintainable, and follows the radical OOP and protocol-less design principles.

### QA
- Verify that all process improvements are followed and that every completed task has a concrete artifact.
- Check that onboarding and process docs are up to date and that the dev container workflow is robust.

---

## PO Next Steps
- Update onboarding and developer documentation to reflect new process and workflow.
- Ensure all new requirements and user feedback are reflected in the sprint’s task files.
- Coordinate with the Scrum Master to monitor progress and update the outline as needed.

---

This file documents the PO's planning and task assignments for Sprint 3. All roles must review and follow these tasks as they proceed.

# Sprint 3 User Prompts and Requirements

**Date:** 2025-07-22

- The PO must specify DevOps tasks to ensure that the project can be bootstrapped, built, and started both inside and outside the dev container. The process must:
  - Detect if it is running inside a Docker container and if the correct Docker image is used.
  - Ensure that running `npm start` inside or outside the container always does the right thing (bootstraps, builds, and starts the container or the app as appropriate).
  - Capture all cases in the DevOps scripts for robust developer onboarding and workflow.
- These requirements must be reflected in the DevOps scripts and onboarding documentation for Sprint 3.
- QA suggests the container terminates because the startup script ends, causing Docker to exit. To keep the dev container running and allow interactive entry, add an interactive shell (e.g., `bash`) at the end of the container startup script.
- PO, DevOps, and Tester: Please review and confirm this approach for Sprint 3.
- Quick test: Add `bash` to the end of the container startup script and verify if the container stays running and is accessible interactively.
