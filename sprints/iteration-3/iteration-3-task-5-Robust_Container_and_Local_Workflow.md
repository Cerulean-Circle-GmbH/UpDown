# Iteration 3 Task 5: Robust Container and Local Workflow

## Background
Automate the build and startup of the dev container using GitHub Actions on every commit, ensuring all project checks run in CI.

## Requirements
- Add a GitHub Actions workflow (`.github/workflows/devcontainer-ci.yml`) to build the dev container and run checks on every push/PR.
- Update Dockerfile and startup scripts to be CI-friendly (skip SSH key setup and repo cloning in CI).
- Document the workflow and any required environment variables in the README.

## Acceptance Criteria
- Workflow builds the dev container and runs all checks on every commit/PR.
- Passes on default branch and PRs.
- Documentation is clear for contributors.

---

**References:**
- [devops/devops-gha-devcontainer-cicd.md](../../devops/devops-gha-devcontainer-cicd.md)
- [devops/devops-scripts-journey.md](../../devops/devops-scripts-journey.md)
- [devops/iteration-refactor-devcontainer.md](../../devops/iteration-refactor-devcontainer.md)
