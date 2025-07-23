# DevOps Scripts Journey: UpDown Project

## Initial State
- The project required a robust, cross-platform dev container setup for consistent development.
- Key requirements: seamless SSH key handling, private repo cloning, and workspace sharing for macOS, Linux, and Windows/WSL.
- The initial approach used multiple bash scripts for each lifecycle step: build, run, status, stop, etc.
- `npm start` was set up to chain these scripts for a one-command developer experience.

## Problems Encountered
- **SSH Key Handling:**
  - SSH keys needed to be available inside the container for private repo cloning.
  - Copying keys at build time failed due to Docker volume mounts hiding files.
  - Permission and ownership issues arose when copying keys as root vs. non-root users.
- **Container State Management:**
  - Containers could be left in stopped or outdated states, causing confusion and errors.
  - Image updates were not always reflected in running containers.
- **Race Conditions:**
  - Chained npm scripts could check container status before it was fully started, leading to false negatives.
  - Sequential script execution was not always deterministic.
- **Cross-Platform Issues:**
  - Windows/WSL required Docker volumes for workspace and SSH key sharing, while macOS/Linux could use native mounts.
  - Special handling for `ssh.outeruser` key pair on Windows/WSL.

## Approaches & Iterations
- Moved SSH key setup from Dockerfile to a container startup script executed as root, then switched to the dev user.
- Refactored `docker-run.sh` to:
  - Detect and clean up outdated containers/images.
  - Handle OS-specific workspace/volume mounting.
  - Add verbose debug output for easier troubleshooting.
- Updated npm scripts to orchestrate all steps, but race conditions persisted due to script chaining.
- Considered two main solutions:
  1. Add wait/retry logic to status checks.
  2. Consolidate all logic into a single orchestrator script for determinism.

## Steps to Solutions
1. **Privileged Setup:**
    - All privileged operations (SSH key copy, permissions) are done in a startup script as root.
    - After setup, the script execs a shell as the non-root dev user.
2. **Robust Container Lifecycle:**
    - `docker-run.sh` checks for outdated containers/images and cleans up as needed.
    - Ensures only one container is running, always from the latest image.
3. **Cross-Platform Support:**
    - macOS/Linux: native workspace mount.
    - Windows/WSL: Docker volume for workspace and SSH keys, with one-time copy logic.
4. **Verbose Debugging:**
    - All scripts print detailed debug info for easier diagnosis.
5. **Refactor to Orchestrator Script (Planned):**
    - Move all lifecycle logic into a single script to eliminate race conditions and ensure deterministic startup.

## Lessons Learned
- Privileged setup must be done at runtime, not build time, when using Docker volumes.
- Chaining scripts via npm can introduce race conditions; a single orchestrator script is more reliable.
- Cross-platform dev environments require careful handling of file mounts and permissions.
- Verbose logging is invaluable for debugging complex automation.

---

This journey documents the evolution of the UpDown project's devOps scripts from a multi-script, race-prone setup to a robust, maintainable, and cross-platform workflow.
