#!/bin/bash
set -e

echo "Cleaning up all unused Docker data (images, containers, volumes, networks)..."
docker system prune -a -f
