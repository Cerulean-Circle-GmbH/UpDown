#!/bin/bash
# Script: clone-updown-repo.sh
# Purpose: Clone the UpDown repository into the dev container after SSH keys are present
set -e

# Detect OS for SSH key logic
UNAME_OUT="$(uname -s)"
if grep -qi microsoft /proc/version 2>/dev/null; then
  OS_TYPE="WSL"
elif [ "$UNAME_OUT" = "Darwin" ]; then
  OS_TYPE="MAC"
else
  OS_TYPE="LINUX"
fi

# Only clone if missing
if [ ! -d /workspace/UpDown ]; then
  echo "Cloning UpDown repository into /workspace/UpDown..."
  if [ "$OS_TYPE" = "WSL" ]; then
    GIT_SSH_COMMAND="ssh -i $HOME/.ssh/ids/ssh.outeruser/id_rsa -o UserKnownHostsFile=$HOME/.ssh/ids/ssh.outeruser/known_hosts" \
      git clone git@github.com:Cerulean-Circle-GmbH/UpDown.git /workspace/UpDown || {
      echo "Failed to clone UpDown repository with ssh.outeruser key. Please check your SSH key and GitHub access.";
      exit 1;
    }
  else
    git clone git@github.com:Cerulean-Circle-GmbH/UpDown.git /workspace/UpDown || {
      echo "Failed to clone UpDown repository. Please check your SSH key and GitHub access.";
      exit 1;
    }
  fi
else
  echo "UpDown repository already present. Skipping clone."
fi
