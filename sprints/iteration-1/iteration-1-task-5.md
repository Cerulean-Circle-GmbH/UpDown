# Usage Instructions for the UpDown Dev Container

**Date:** 2025-07-21

## How to Build and Use the Dev Container

1. Open the project in VS Code.
2. If you have the Dev Containers extension installed, VS Code will prompt you to reopen the project in the container. Accept the prompt.
3. The container will build automatically using the `.devcontainer/Dockerfile` and `.devcontainer/install-dev-env.sh`.
4. Once the build is complete, you will be inside the container as the `devuser` user, with `/workspace` as your working directory.
5. Bun, git, and build-essential are pre-installed and available in the PATH.
6. Recommended VS Code extensions will be suggested for installation.
7. You can now start developing and running the project as described in the README.

## Troubleshooting
- If the container fails to build, check the logs for errors in the Dockerfile or install script.
- Make sure Docker Desktop is running on your machine.
- For further help, consult the VS Code Dev Containers documentation.

## Next Step
- Scrum Master to update the project status outline and plan the next iteration or feature breakdown.
