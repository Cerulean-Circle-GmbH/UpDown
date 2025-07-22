#!/bin/bash
set -e

CONTAINER_NAME="updown-dev-container"
IMAGE_NAME="updown-dev"

if docker ps | grep -q "$CONTAINER_NAME"; then
  echo "Dev container '$CONTAINER_NAME' is already running."
else
  echo "Starting dev container '$CONTAINER_NAME'..."
  docker run -d --name "$CONTAINER_NAME" -v $(pwd):/workspace -p 3000:3000 "$IMAGE_NAME" tail -f /dev/null
fi
