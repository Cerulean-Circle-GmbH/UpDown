# Containerized Developer Workflow (macOS, Docker, Bun)

**Date:** 2025-07-22

## Overview
This document describes the correct workflow for UpDown developers using a containerized environment on macOS. It clarifies the responsibilities of npm on the host and how to attach and run Bun/server/client commands inside the dev container.

## Workflow Steps

1. **Build and Start the Dev Container (from host/macOS):**
   - Use `npm start` to build and start the dev container. This manages the Docker lifecycle only.
   - Example:
     ```sh
     npm start
     # or
     npm run docker:build && npm run docker:run
     ```
   - This will NOT run Bun or any server/client code on the host.

2. **Attach to the Running Dev Container:**
   - Use one of the following methods:
     - **VS Code Remote Containers:**
       - Open the project in VS Code.
       - Use the "Dev Containers: Attach to Running Container..." command and select `updown-dev-container`.
     - **Terminal (docker exec):**
       - Run:
         ```sh
         docker exec -it updown-dev-container /bin/bash
         ```

3. **Run Bun/Server/Client Commands (inside the container):**
   - Once inside the container shell, run:
     ```sh
     bun install
     npm run start:server
     # or
     bun src/server/index.ts
     ```
   - All Bun-related development must be done inside the container.

4. **Stop the Dev Container (from host/macOS):**
   - Use:
     ```sh
     npm run docker:stop
     ```

## Notes
- Never run Bun or server/client code directly on the host.
- All dependencies and scripts must be installed and run inside the dev container.
- The onboarding and developer docs must reference this workflow.

---

This document is the authoritative reference for the UpDown containerized developer workflow. All onboarding and process docs must be kept in sync with this workflow.
