#!/bin/bash
set -e

IMAGE_NAME="updown-dev"

if docker images | grep -q "$IMAGE_NAME"; then
  echo "Docker image '$IMAGE_NAME' exists."
else
  echo "Docker image '$IMAGE_NAME' not found. Building..."
  ./devops/docker-build.sh
fi
