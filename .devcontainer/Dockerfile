# Dockerfile for UpDown Dev Container
FROM ubuntu:22.04

# Copy and run install script
COPY .devcontainer/install-dev-env.sh /tmp/install-dev-env.sh
RUN bash /tmp/install-dev-env.sh

# Add non-root user
RUN useradd -ms /bin/bash devuser


# Copy container startup script and set permissions as root
COPY .devcontainer/container-startup.sh /usr/local/bin/container-startup.sh
RUN chmod +x /usr/local/bin/container-startup.sh


WORKDIR /workspace

# Expose default dev server port
EXPOSE 3000

# Set PATH for Bun
ENV PATH="/home/devuser/.bun/bin:$PATH"

# Run the startup script on container start as root, drop to devuser for shell
ENTRYPOINT ["/usr/local/bin/container-startup.sh"]
