#!/bin/bash
set -e

# Install dependencies
apt-get update
apt-get install -y curl git build-essential
rm -rf /var/lib/apt/lists/*

# Install Bun
curl -fsSL https://bun.sh/install | bash
