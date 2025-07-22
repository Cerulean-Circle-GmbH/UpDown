# Developer Workflow Documentation

**Author:** DevOps (with PO and Developer feedback)
**Date:** 2025-07-21

## Getting Started

1. Run `npm start` from the project root.
2. If the dev Docker container does not exist, it will be built automatically.
3. If the container is not running, it will be started in the background (non-interactive, developer-friendly mode).
4. The workspace is mounted and available for development in VS Code.
5. No terminal or Copilot blocking occurs.

## Scripts

- `npm start`: Main entry for developers. Checks if the container is running, builds if needed, and starts if not running.
- `npm run docker:build`: Builds the dev container.
- `npm run docker:start`: Starts the dev container in the background.
- `npm run docker:status`: Checks if the dev container is running.

## Cross-Platform Notes
- Scripts use standard Docker commands and should work on macOS, Linux, and Windows WSL2 (with Docker installed).

## Feedback
- Please review and provide feedback before implementation is finalized.

---

## Recovery Process Optimization

- When context is lost, check for workflow documentation in `devops/` and reference it in the recovery instructions.
- Ensure all workflow and process documentation is authored by the responsible role and stored in the corresponding directory.
- Update the recovery instructions in `restart.md` and `project.outline.md` to include a step for consulting workflow documentation in `devops/`.
