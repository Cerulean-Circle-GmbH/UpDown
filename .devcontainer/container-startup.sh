#!/bin/bash
set -e

# This script runs inside the container at startup to copy SSH keys from /workspace/.ssh (mounted or copied in by host) to the devuser's home, set permissions, and add keys to the agent.

SSH_OUTERUSER_DIR="/workspace/.ssh/ids/ssh.outeruser"
DEVUSER_HOME="/home/devuser"

if [ -d "$SSH_OUTERUSER_DIR" ]; then
  mkdir -p "$DEVUSER_HOME/.ssh/ids/ssh.outeruser"
  cp -r $SSH_OUTERUSER_DIR/* "$DEVUSER_HOME/.ssh/ids/ssh.outeruser/"
  chown -R devuser:devuser "$DEVUSER_HOME/.ssh/ids/ssh.outeruser"
  chmod 700 "$DEVUSER_HOME/.ssh/ids/ssh.outeruser"
  chmod 600 "$DEVUSER_HOME/.ssh/ids/ssh.outeruser/id_rsa" || true
  chmod 644 "$DEVUSER_HOME/.ssh/ids/ssh.outeruser/id_rsa.pub" || true
  echo "ssh.outeruser key directory copied and permissions set."
fi

# Copy any default keys (id_ed25519, id_rsa, etc.)
if [ -d "/workspace/.ssh" ]; then
  for keyfile in /workspace/.ssh/id_*; do
    [ -f "$keyfile" ] || continue
    cp "$keyfile" "$DEVUSER_HOME/.ssh/"
    chown devuser:devuser "$DEVUSER_HOME/.ssh/$(basename $keyfile)"
    if [[ "$keyfile" == *.pub ]]; then
      chmod 644 "$DEVUSER_HOME/.ssh/$(basename $keyfile)"
    else
      chmod 600 "$DEVUSER_HOME/.ssh/$(basename $keyfile)"
    fi
  done
fi

# Start ssh-agent and add keys (as devuser)
su devuser -c 'eval $(ssh-agent -s); for key in $HOME/.ssh/id_*; do [[ $key != *.pub ]] && ssh-add $key 2>/dev/null; done'

# Drop to devuser shell for devcontainer interactive use
exec su - devuser
