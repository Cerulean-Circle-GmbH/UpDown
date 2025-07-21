# Dockerfile for UpDown Dev Container
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
