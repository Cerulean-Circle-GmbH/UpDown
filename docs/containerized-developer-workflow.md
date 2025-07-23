# Containerized Developer Workflow

**Date:** 2025-07-22

## Overview
This document describes the recommended workflow for developing UpDown using a containerized environment. All development should occur inside the dev container, managed by npm scripts on the host.

## Workflow Steps

1. **Dev Container Lifecycle Management (Host):**
   - Use `npm start` and related scripts to build, start, stop, and check the status of the dev container.
   - No Bun/server/client commands should be run directly on the host.

2. **Running Bun/Server/Client (Inside Container):**
   - All Bun, server, and client commands must be executed inside the dev container.
   - Use VS Code Remote Containers or `docker exec -it <container> /bin/bash` to attach to the running container for interactive development.

3. **Attaching to the Dev Container:**
   - **VS Code:** Use the "Remote - Containers" extension to open the workspace inside the container.
   - **CLI:** Use `docker exec -it <container_name> /bin/bash` to get a shell inside the container.

4. **Onboarding:**
   - New developers should follow onboarding docs to set up Docker, clone the repo, and use npm scripts to manage the container lifecycle.
   - All development, testing, and debugging should occur inside the container.

## Responsibilities
- **Host:** Only manages the container lifecycle via npm scripts.
- **Container:** All code execution, development, and testing.

## References
- See onboarding and developer documentation for step-by-step instructions.
- For troubleshooting, consult the dev container logs and documentation in `docs/`.

---

*This workflow ensures consistency and reproducibility for all developers working on UpDown.*
