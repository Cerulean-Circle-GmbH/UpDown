#!/bin/bash
set -e

CONTAINER_NAME="updown-dev-container"

if docker ps | grep -q "$CONTAINER_NAME"; then
  echo "Dev container '$CONTAINER_NAME' is running."
  docker ps | grep "$CONTAINER_NAME"
else
  echo "Dev container '$CONTAINER_NAME' is not running."
fi
