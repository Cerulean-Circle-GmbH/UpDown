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



# Get the image ID for updown-dev:latest
IMAGE_ID_LATEST=$(docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' | grep "^$IMAGE_NAME:latest " | awk '{print $2}')
echo "[DEBUG] Latest image ID for $IMAGE_NAME:latest: $IMAGE_ID_LATEST"

# Get the container ID (running or stopped)
CONTAINER_ID=$(docker ps -aqf "name=^${CONTAINER_NAME}$")
echo "[DEBUG] Existing container ID for $CONTAINER_NAME: $CONTAINER_ID"
CONTAINER_IMAGE_ID=""
CONTAINER_RUNNING=0
if [ -n "$CONTAINER_ID" ]; then
  CONTAINER_IMAGE_ID=$(docker inspect --format='{{.Image}}' "$CONTAINER_ID" 2>/dev/null || true)
  echo "[DEBUG] Existing container's image ID: $CONTAINER_IMAGE_ID"
  # Check if container is running
  if docker ps -q --no-trunc | grep -q "$CONTAINER_ID"; then
    CONTAINER_RUNNING=1
  fi
fi


# If container exists but image is outdated, stop and remove it
if [ -n "$CONTAINER_ID" ] && [ -n "$IMAGE_ID_LATEST" ] && [ "$CONTAINER_IMAGE_ID" != "$IMAGE_ID_LATEST" ]; then
  echo "[INFO] A newer image is available. Stopping and removing old container..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  CONTAINER_ID=""
  CONTAINER_RUNNING=0
fi

# If container exists but is stopped, remove it
if [ -n "$CONTAINER_ID" ] && [ "$CONTAINER_RUNNING" = 0 ]; then
  echo "[INFO] Removing stopped container $CONTAINER_NAME before starting a new one."
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  CONTAINER_ID=""
fi

if [ -z "$CONTAINER_ID" ]; then
  if [ "$OS_TYPE" = "MAC" ]; then
    echo "[INFO] Detected macOS. Mounting workspace natively."
    docker run -d --name "$CONTAINER_NAME" -v $(pwd):/workspace -p 3000:3000 "$IMAGE_NAME" tail -f /dev/null
  elif [ "$OS_TYPE" = "WSL" ]; then
    echo "[INFO] Detected Windows/WSL. Using Docker volume for workspace and SSH key sharing."
    VOLUME_NAME="updown-workspace-vol"
    # Create volume if it doesn't exist
    if ! docker volume ls | grep -q "$VOLUME_NAME"; then
      echo "[DEBUG] Creating Docker volume $VOLUME_NAME..."
      docker volume create "$VOLUME_NAME"
      # Copy workspace and .ssh into the volume (one-time setup)
      TMP_CID=$(docker create -v "$VOLUME_NAME":/workspace busybox)
      echo "[DEBUG] Copying workspace and .ssh into volume via temp container $TMP_CID..."
      docker cp . "$TMP_CID":/workspace
      if [ -d "$HOME/.ssh" ]; then
        docker cp "$HOME/.ssh" "$TMP_CID":/workspace/.ssh
      fi
      docker rm "$TMP_CID"
    fi
    # Check if volume is associated with a stopped container with a different image
    VOLUME_CONTAINERS=$(docker ps -a --filter volume=$VOLUME_NAME --format '{{.ID}}')
    for vcid in $VOLUME_CONTAINERS; do
      vimg=$(docker inspect --format='{{.Image}}' "$vcid" 2>/dev/null || true)
      if [ "$vimg" != "$IMAGE_ID_LATEST" ]; then
        echo "[WARNING] Volume $VOLUME_NAME is associated with container $vcid using image $vimg, but latest is $IMAGE_ID_LATEST."
      fi
    done
    docker run -d --name "$CONTAINER_NAME" -v "$VOLUME_NAME":/workspace -p 3000:3000 "$IMAGE_NAME" tail -f /dev/null
  else
    echo "[INFO] Detected Linux. Mounting workspace natively."
    docker run -d --name "$CONTAINER_NAME" -v $(pwd):/workspace -p 3000:3000 "$IMAGE_NAME" tail -f /dev/null
  fi
else
  echo "[INFO] Dev container '$CONTAINER_NAME' is already running and up to date."
  exit 0
fi
