#!/bin/bash
# Script: sync-workspace-to-host.sh
# Purpose: Sync the current workspace directory from inside the dev container to your user home workspace/UpDown on your Mac via SSH/rsync
# Usage: Run this script from inside the container.
# Example: ./devops/sync-workspace-to-host.sh <your-mac-username>@<your-mac-hostname> [remote-path]
# If no parameters are given, defaults to donges@192.168.178.22:/Users/donges/workspace/UpDown

set -e

DEFAULT_MAC_USER_HOST="donges@192.168.178.22"
DEFAULT_REMOTE_PATH="/Users/donges/workspace/UpDown"

MAC_USER_HOST="$1"
REMOTE_PATH="$2"

if [ -z "$MAC_USER_HOST" ]; then
  echo "No MAC_USER_HOST provided. Default: $DEFAULT_MAC_USER_HOST"
  read -p "Use default SSH target ($DEFAULT_MAC_USER_HOST)? [Y/n]: " yn
  case $yn in
    [Nn]*) echo "Cancelled."; exit 0;;
    *) MAC_USER_HOST="$DEFAULT_MAC_USER_HOST";;
  esac
fi

if ! [[ "$MAC_USER_HOST" =~ ^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$ ]]; then
  echo "Invalid format for MAC_USER_HOST. Use <username>@<hostname>."
  exit 2
fi

if [ -z "$REMOTE_PATH" ]; then
  REMOTE_PATH="$DEFAULT_REMOTE_PATH"
  echo "No remote path provided. Default: $REMOTE_PATH"
fi

LOCAL_PATH="/workspace/"

rsync -avz --delete --exclude='.git' --exclude='node_modules' "$LOCAL_PATH" "$MAC_USER_HOST":"$REMOTE_PATH"

echo "Workspace synced to $MAC_USER_HOST:$REMOTE_PATH"
