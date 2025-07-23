# DevOps/Lead Developer Log - Iteration 1

**Date:** 2025-07-21

## Task 1: Define Requirements for the Docker Development Container

- **Base Image:** Ubuntu (latest LTS)
- **Programming Language:** TypeScript (Node.js runtime)
- **Package Manager:** Bun (latest stable)
- **Essential Tools:**
  - git
  - curl
  - build-essential
  - VS Code extensions: ms-vscode.vscode-typescript-next, eg2.tslint, ms-azuretools.vscode-docker
- **Other:**
  - Non-root user for development
  - Expose port 3000 (default for many dev servers)
  - Set working directory to /workspace

## Next Step
- Create a Dockerfile with the specified environment.
