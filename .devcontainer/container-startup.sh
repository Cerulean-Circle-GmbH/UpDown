#!/bin/bash
set -e

# This script runs inside the container at startup to copy SSH keys from /workspace/.ssh (mounted or copied in by host) to the devuser's home, set permissions, and add keys to the agent.


SSH_OUTERUSER_KEY="/workspace/.ssh/ids/ssh.outeruser/id_rsa"
SSH_OUTERUSER_PUB="/workspace/.ssh/ids/ssh.outeruser/id_rsa.pub"
DEVUSER_HOME="/home/devuser"

# If ssh.outeruser key exists, copy it as the main id_rsa/id_rsa.pub
if [ -f "$SSH_OUTERUSER_KEY" ]; then
  mkdir -p "$DEVUSER_HOME/.ssh"
  cp "$SSH_OUTERUSER_KEY" "$DEVUSER_HOME/.ssh/id_rsa"
  chown devuser:devuser "$DEVUSER_HOME/.ssh/id_rsa"
  chmod 600 "$DEVUSER_HOME/.ssh/id_rsa"
  if [ -f "$SSH_OUTERUSER_PUB" ]; then
    cp "$SSH_OUTERUSER_PUB" "$DEVUSER_HOME/.ssh/id_rsa.pub"
    chown devuser:devuser "$DEVUSER_HOME/.ssh/id_rsa.pub"
    chmod 644 "$DEVUSER_HOME/.ssh/id_rsa.pub"
  fi
  echo "ssh.outeruser key copied as id_rsa and permissions set."
fi

# Copy any other default keys (id_ed25519, etc.), but skip id_rsa if already set
if [ -d "/workspace/.ssh" ]; then
  for keyfile in /workspace/.ssh/id_*; do
    [ -f "$keyfile" ] || continue
    basekey="$(basename $keyfile)"
    # Skip id_rsa and id_rsa.pub if already set from ssh.outeruser
    if [[ "$basekey" == "id_rsa" || "$basekey" == "id_rsa.pub" ]]; then
      [ -f "$DEVUSER_HOME/.ssh/$basekey" ] && continue
    fi
    cp "$keyfile" "$DEVUSER_HOME/.ssh/"
    chown devuser:devuser "$DEVUSER_HOME/.ssh/$basekey"
    if [[ "$basekey" == *.pub ]]; then
      chmod 644 "$DEVUSER_HOME/.ssh/$basekey"
    else
      chmod 600 "$DEVUSER_HOME/.ssh/$basekey"
    fi
  done
fi

# Start ssh-agent and add keys (as devuser)
su devuser -c 'eval $(ssh-agent -s); for key in $HOME/.ssh/id_*; do [[ $key != *.pub ]] && ssh-add $key 2>/dev/null; done'



# Ensure the clone-updown-repo.sh script is executable before calling it
if [ -f /workspace/devops/clone-updown-repo.sh ]; then
  chmod +x /workspace/devops/clone-updown-repo.sh
  bash /workspace/devops/clone-updown-repo.sh
else
  echo "/workspace/devops/clone-updown-repo.sh not found. Skipping repo clone."
fi

# Drop to devuser shell for devcontainer interactive use
exec su - devuser

# At the end of the script, start an interactive shell to keep the container alive
exec bash
