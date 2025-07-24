#!/bin/bash
# Script: copy-ssh-key-to-container.sh
# Purpose: Copy your SSH private/public key from the host into the dev container for GitHub access
# Usage: Run this script from your host, not inside the container.
# Example: ./devops/copy-ssh-key-to-container.sh ~/.ssh/id_ed25519

set -e

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-private-key> [container-name]"
  exit 1
fi

KEY_PATH="$1"
CONTAINER_NAME="$(basename $(pwd))_devcontainer"
if [ "$2" != "" ]; then
  CONTAINER_NAME="$2"
fi

if [ ! -f "$KEY_PATH" ]; then
  echo "Key file not found: $KEY_PATH"
  exit 2
fi

PUB_KEY_PATH="${KEY_PATH}.pub"

# Ensure .ssh directory exists in the container
docker exec "$CONTAINER_NAME" mkdir -p /home/developking/.ssh

# Copy private key
docker cp "$KEY_PATH" "$CONTAINER_NAME":/home/developking/.ssh/
# Copy public key if it exists
if [ -f "$PUB_KEY_PATH" ]; then
  docker cp "$PUB_KEY_PATH" "$CONTAINER_NAME":/home/developking/.ssh/
fi

docker exec "$CONTAINER_NAME" chown developking:developking /home/developking/.ssh/$(basename "$KEY_PATH")
docker exec "$CONTAINER_NAME" chmod 600 /home/developking/.ssh/$(basename "$KEY_PATH")
if [ -f "$PUB_KEY_PATH" ]; then
  docker exec "$CONTAINER_NAME" chown developking:developking /home/developking/.ssh/$(basename "$PUB_KEY_PATH")
  docker exec "$CONTAINER_NAME" chmod 644 /home/developking/.ssh/$(basename "$PUB_KEY_PATH")
fi

echo "SSH key(s) copied to container $CONTAINER_NAME. You may now use git inside the dev container."
