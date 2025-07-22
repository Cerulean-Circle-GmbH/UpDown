#!/bin/bash
set -e

CONTAINER_NAME="updown-dev-container"

echo "Stopping and removing dev container '$CONTAINER_NAME' if it exists..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true
