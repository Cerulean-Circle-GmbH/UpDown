# DevOps Log - Iteration 1 Task 2

**Date:** 2025-07-21

## Task 2: Create a Dockerfile with the Specified Environment

- Create a Dockerfile based on Ubuntu (latest LTS)
- Use a separate bash install script for installing dependencies and tools (separation of concerns)
- The Dockerfile should only handle Docker-specific instructions and call the install script
- Set up a non-root user for development
- Set working directory to /workspace
- Expose port 3000
- (VS Code extensions will be handled in devcontainer.json)

---

# Quality Assurance Feedback (2025-07-21)
- The RUN statement for installing dependencies should be replaced by a single bash install script that holds the commands to install the container dependencies. This improves separation of concerns: the Dockerfile deals with Docker, and the shell script deals with shell commands.
- Please update the suggestion accordingly.
- Additional QA: Double check if the non-root user creation (`RUN useradd -ms /bin/bash devuser`) can be part of the install script or if it must remain in the Dockerfile. Document findings and update the plan as needed.
- Ensure the project structure remains organized and does not spiral out of control. The Dockerfile and related files must be placed in the correct folder structure for a GitHub dev container as described in the README. The PO should define a task for any required structural changes. The Scrum Master will always enforce this discipline and execute improvements before moving to the next tasks.

---

# Dockerfile (to be improved)
FROM ubuntu:22.04

# Copy and run install script
COPY install-dev-env.sh /tmp/install-dev-env.sh
RUN bash /tmp/install-dev-env.sh

# Add non-root user
RUN useradd -ms /bin/bash devuser
USER devuser
WORKDIR /workspace

# Expose default dev server port
EXPOSE 3000

# Set PATH for Bun
ENV PATH="/home/devuser/.bun/bin:$PATH"

# install-dev-env.sh (to be created)
#
# #!/bin/bash
# set -e
# apt-get update
# apt-get install -y curl git build-essential
# rm -rf /var/lib/apt/lists/*
# curl -fsSL https://bun.sh/install | bash
