#!/bin/bash
set -e

# Clean up Docker
./devops/docker-clean.sh

# Build Docker image
./devops/docker-build.sh

# Check Docker image
./devops/docker-check.sh

# Run container
./devops/docker-run.sh

# Show status
./devops/docker-status.sh
