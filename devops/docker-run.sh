#!/bin/bash
set -e


CONTAINER_NAME="updown-dev-container"
IMAGE_NAME="updown-dev"

# Detect OS
UNAME_OUT="$(uname -s)"
if grep -qi microsoft /proc/version 2>/dev/null; then
  OS_TYPE="WSL"
elif [ "$UNAME_OUT" = "Darwin" ]; then
  OS_TYPE="MAC"
else
  OS_TYPE="LINUX"
fi

if docker ps | grep -q "$CONTAINER_NAME"; then
  echo "Dev container '$CONTAINER_NAME' is already running."
else
  if [ "$OS_TYPE" = "MAC" ]; then
    echo "Detected macOS. Mounting workspace natively."
    docker run -d --name "$CONTAINER_NAME" -v $(pwd):/workspace -p 3000:3000 "$IMAGE_NAME" tail -f /dev/null
  elif [ "$OS_TYPE" = "WSL" ]; then
    echo "Detected Windows/WSL. Using Docker volume for workspace and SSH key sharing."
    VOLUME_NAME="updown-workspace-vol"
    # Create volume if it doesn't exist
    if ! docker volume ls | grep -q "$VOLUME_NAME"; then
      docker volume create "$VOLUME_NAME"
      # Copy workspace and .ssh into the volume (one-time setup)
      TMP_CID=$(docker create -v "$VOLUME_NAME":/workspace busybox)
      docker cp . "$TMP_CID":/workspace
      if [ -d "$HOME/.ssh" ]; then
        docker cp "$HOME/.ssh" "$TMP_CID":/workspace/.ssh
      fi
      docker rm "$TMP_CID"
    fi
    docker run -d --name "$CONTAINER_NAME" -v "$VOLUME_NAME":/workspace -p 3000:3000 "$IMAGE_NAME" tail -f /dev/null
  else
    echo "Detected Linux. Mounting workspace natively."
    docker run -d --name "$CONTAINER_NAME" -v $(pwd):/workspace -p 3000:3000 "$IMAGE_NAME" tail -f /dev/null
  fi
fi
