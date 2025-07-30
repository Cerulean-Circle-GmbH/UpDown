# Iteration 3 Task 4: Robust Container and Local Workflow

## Background
Automate the build and startup of the dev container using GitHub Actions on every commit, ensuring all project checks run in CI.

## Requirements
- Add a GitHub Actions workflow (`.github/workflows/devcontainer-ci.yml`) to build the dev container and run checks on every push/PR.
- Update Dockerfile and startup scripts to be CI-friendly (skip SSH key setup and repo cloning in CI).
- Document the workflow and any required environment variables in the README.
- Refactor npm scripts to ensure modular separation of:
  - Container lifecycle management
  - SSH key management
  - Test execution
- Update onboarding documentation to reference the new modular scripts and process improvements from QA audit.

## Acceptance Criteria
- Workflow builds the dev container and runs all checks on every commit/PR.
- Passes on default branch and PRs.
- Documentation is clear for contributors.
- Each major operation is handled by a dedicated, maintainable script as per QA audit findings.
- Onboarding docs reference the modular scripts and process improvements.

---

**References:**
- [devops/devops-gha-devcontainer-cicd.md](../../devops/devops-gha-devcontainer-cicd.md)
- [devops/devops-scripts-journey.md](../../devops/devops-scripts-journey.md)
- [devops/iteration-refactor-devcontainer.md](../../devops/iteration-refactor-devcontainer.md)

## Dependencies
- [Iteration 3 Task 1: Document Containerized Developer Workflow](./iteration-3-task-1.md)
- [Iteration 3 Task 2: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-2.md)
- [Iteration 3 Task 3: Document Containerized Developer Workflow](./iteration-3-task-3.md)
