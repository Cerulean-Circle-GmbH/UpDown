# Dockerfile for UpDown Dev Container
FROM ubuntu:22.04


# Add non-root user before install steps
RUN useradd -ms /bin/bash devuser

# Copy and run install script as root (installs for both root and devuser)
COPY .devcontainer/install-dev-env.sh /tmp/install-dev-env.sh
RUN bash /tmp/install-dev-env.sh

USER devuser
WORKDIR /workspace

# Expose default dev server port
EXPOSE 3000

# Set PATH for Bun
ENV PATH="/home/devuser/.bun/bin:$PATH"
