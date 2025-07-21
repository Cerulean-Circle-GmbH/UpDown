#!/bin/bash
set -e

# Install dependencies
apt-get update
apt-get install -y curl git build-essential unzip
rm -rf /var/lib/apt/lists/*

# Install Bun
curl -fsSL https://bun.sh/install | bash
# Verify Bun installation
/root/.bun/bin/bun --version
