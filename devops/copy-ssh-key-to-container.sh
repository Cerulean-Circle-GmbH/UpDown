#!/bin/bash
# Script: copy-ssh-key-to-container.sh
# Purpose: Copy your SSH private/public key from the host into the dev container for GitHub access
# Usage: Run this script from your host, not inside the container.
# Example: ./devops/copy-ssh-key-to-container.sh ~/.ssh/id_ed25519

set -e


# Detect OS
UNAME_OUT="$(uname -s)"
if grep -qi microsoft /proc/version 2>/dev/null; then
  OS_TYPE="WSL"
elif [ "$UNAME_OUT" = "Darwin" ]; then
  OS_TYPE="MAC"
else
  OS_TYPE="LINUX"
fi

CONTAINER_NAME="updown-dev-container"
if [ "$2" != "" ]; then
  CONTAINER_NAME="$2"
fi

if [ "$OS_TYPE" = "WSL" ]; then
  # Always copy the ssh.outeruser directory for Windows/WSL
  SSH_OUTERUSER_DIR="$HOME/.ssh/ids/ssh.outeruser"
  if [ -d "$SSH_OUTERUSER_DIR" ]; then
    docker exec "$CONTAINER_NAME" mkdir -p /home/devuser/.ssh/ids/ssh.outeruser
    docker cp "$SSH_OUTERUSER_DIR/." "$CONTAINER_NAME":/home/devuser/.ssh/ids/ssh.outeruser/
    docker exec "$CONTAINER_NAME" sudo chown -R devuser:devuser /home/devuser/.ssh/ids/ssh.outeruser
    docker exec "$CONTAINER_NAME" sudo chmod 700 /home/devuser/.ssh/ids/ssh.outeruser
    docker exec "$CONTAINER_NAME" sudo chmod 600 /home/devuser/.ssh/ids/ssh.outeruser/id_rsa
    docker exec "$CONTAINER_NAME" sudo chmod 644 /home/devuser/.ssh/ids/ssh.outeruser/id_rsa.pub
    echo "ssh.outeruser key directory copied to container $CONTAINER_NAME."
  else
    echo "Warning: ssh.outeruser key directory not found: $SSH_OUTERUSER_DIR. Skipping copy."
  fi
else
  # Default: copy single key as before
  if [ "$#" -lt 1 ] || [ -z "$1" ]; then
    KEY_PATH="$HOME/.ssh/id_ed25519"
    echo "No key path provided, using default: $KEY_PATH"
  else
    KEY_PATH="$1"
  fi
  if [ ! -f "$KEY_PATH" ]; then
    echo "Warning: Key file not found: $KEY_PATH. Skipping SSH key copy."
    exit 0
  fi
  PUB_KEY_PATH="${KEY_PATH}.pub"
  docker cp "$KEY_PATH" "$CONTAINER_NAME":/home/devuser/.ssh/
  if [ -f "$PUB_KEY_PATH" ]; then
    docker cp "$PUB_KEY_PATH" "$CONTAINER_NAME":/home/devuser/.ssh/
  fi
  docker exec "$CONTAINER_NAME" chown devuser:devuser /home/devuser/.ssh/$(basename "$KEY_PATH")
  docker exec "$CONTAINER_NAME" chmod 600 /home/devuser/.ssh/$(basename "$KEY_PATH")
  if [ -f "$PUB_KEY_PATH" ]; then
    docker exec "$CONTAINER_NAME" chown devuser:devuser /home/devuser/.ssh/$(basename "$PUB_KEY_PATH")
    docker exec "$CONTAINER_NAME" chmod 644 /home/devuser/.ssh/$(basename "$PUB_KEY_PATH")
  fi
  echo "SSH key(s) copied to container $CONTAINER_NAME. You may now use git inside the dev container."
fi
