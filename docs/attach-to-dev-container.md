# Attaching to the Dev Container

**Date:** 2025-07-22

## How to Attach

- **VS Code:** Use the "Remote - Containers" extension to open the workspace inside the running dev container.
- **Command Line:** Run:
  
  ```bash
  npm run attach
  ```
  This will open a bash shell inside the running dev container (`updown-dev-container`).

## Notes
- All Bun/server/client commands must be run inside the container.
- If the container is not running, start it with:
  
  ```bash
  npm start
  ```

---

For more details, see `docs/containerized-developer-workflow.md`.
