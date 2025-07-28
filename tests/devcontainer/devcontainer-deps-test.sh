#!/bin/bash
# UpDown/tests/devcontainer/devcontainer-deps-test.sh
# Test script to verify devcontainer dependencies for UpDown

set -e

# Run dependency checks inside the devcontainer using docker exec
# Assumes the devcontainer is running and named 'updown-dev-container'
CONTAINER_NAME=$(docker ps --filter "name=updown-dev-container" --format "{{.Names}}" | head -n 1)
if [ -z "$CONTAINER_NAME" ]; then
  echo "Devcontainer is NOT running. Please start it with 'npm start'."
  exit 1
fi

docker exec "$CONTAINER_NAME" bash -c '
  echo "--- ENVIRONMENT DIAGNOSTICS ---"
  echo "User: $(whoami)"
  echo "PATH: $PATH"
  env
  echo "-------------------------------"

  # Check for Node.js
  if ! command -v node &> /dev/null; then
    echo "Node.js is NOT installed."
    exit 1
  fi

  # Check for Bun
  if ! command -v bun &> /dev/null; then
    echo "Bun is NOT installed."
    exit 1
  fi

  # Check for TypeScript
  if ! command -v tsc &> /dev/null; then
    echo "TypeScript (tsc) is NOT installed."
    exit 1
  fi


  # [TEMPLATE] Check for shared model files (currently disabled)
  # for f in /workspace/src/shared/Card.ts /workspace/src/shared/GameModel.ts /workspace/src/shared/Lobby.ts /workspace/src/shared/Player.ts /workspace/src/shared/Scenario.ts; do
  #   if [ ! -f "$f" ]; then
  #     echo "Missing shared file: $f"
  #     exit 1
  #   fi
  # done

  # If all checks pass
  echo "All required devcontainer dependencies for UpDown are installed."
  exit 0
'
