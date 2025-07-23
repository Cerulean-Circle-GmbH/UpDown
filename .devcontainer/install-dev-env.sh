#!/bin/bash
set -e

# Fix for GPG signature errors in Ubuntu repos (dev only)
apt-get update -o Acquire::AllowInsecureRepositories=true || apt-get update --allow-unauthenticated
apt-get install -y --allow-unauthenticated curl git build-essential unzip openssh-client gnupg
rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS)
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt-get install -y --allow-unauthenticated nodejs
fi

# Install Bun
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi


# Detect OS for SSH key logic
UNAME_OUT="$(uname -s)"
if grep -qi microsoft /proc/version 2>/dev/null; then
  OS_TYPE="WSL"
elif [ "$UNAME_OUT" = "Darwin" ]; then
  OS_TYPE="MAC"
else
  OS_TYPE="LINUX"
fi

# SSH agent forwarding setup for GitHub
if [ -d /workspaces/.ssh ]; then
  mkdir -p $HOME/.ssh
  cp -r /workspaces/.ssh/* $HOME/.ssh/
  chmod 700 $HOME/.ssh
  chmod 600 $HOME/.ssh/*
  eval $(ssh-agent -s)
  if [ "$OS_TYPE" = "WSL" ]; then
    # Use ssh.outeruser key for git clone
    SSH_KEY_OUTERUSER="$HOME/.ssh/ids/ssh.outeruser/id_rsa"
    if [ -f "$SSH_KEY_OUTERUSER" ]; then
      ssh-add "$SSH_KEY_OUTERUSER"
    fi
  else
    # Add all id_* keys except .pub
    for key in $HOME/.ssh/id_*; do
      if [[ $key != *.pub ]]; then
        ssh-add $key
      fi
    done
  fi
fi

# Verify Bun installation
/root/.bun/bin/bun --version

# Install project dependencies (Bun preferred, fallback to npm)



# Install project dependencies (Bun preferred, fallback to npm)
if [ -f /workspaces/UpDown/package.json ]; then
  cd /workspaces/UpDown
  if command -v bun >/dev/null 2>&1; then
    bun install
  else
    npm install
  fi
fi

echo "Dev environment setup complete."
