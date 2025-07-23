#!/bin/bash
# Script: copy-ssh-key-to-container.sh
# Purpose: Copy your SSH private/public key from the host into the dev container for GitHub access
# Usage: Run this script from your host, not inside the container.
# Example: ./devops/copy-ssh-key-to-container.sh ~/.ssh/id_ed25519

set -e


# Set default key path if not provided
if [ "$#" -lt 1 ] || [ -z "$1" ]; then
  KEY_PATH="$HOME/.ssh/id_ed25519"
  echo "No key path provided, using default: $KEY_PATH"
else
  KEY_PATH="$1"
fi

CONTAINER_NAME="$(basename $(pwd))_devcontainer"
if [ "$2" != "" ]; then
  CONTAINER_NAME="$2"
fi


if [ ! -f "$KEY_PATH" ]; then
  echo "Warning: Key file not found: $KEY_PATH. Skipping SSH key copy."
  exit 0
fi

PUB_KEY_PATH="${KEY_PATH}.pub"

# Copy private key
docker cp "$KEY_PATH" "$CONTAINER_NAME":/home/devuser/.ssh/
# Copy public key if it exists
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
