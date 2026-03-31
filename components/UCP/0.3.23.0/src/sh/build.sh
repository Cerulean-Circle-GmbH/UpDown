#!/usr/bin/env sh
# @web4x/ucp 0.3.23.0 - Foundation build
# No external Web4 dependencies — builds standalone.
# This is the FOUNDATION component: builds first, everything else depends on it.
#
# Build flow:
# 1. Install npm dependencies (none currently)
# 2. Compile all TypeScript (layers 2-5)

# Parse flags
VERBOSE=false
FORCE=false
for arg in "$@"; do
    case "$arg" in
        verbose) VERBOSE=true ;;
        silent) VERBOSE=false ;;
        force) FORCE=true ;;
    esac
done

# Get paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
COMPONENT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Step 1: Ensure node_modules exists
if [ ! -d "$COMPONENT_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    (cd "$COMPONENT_DIR" && npm install)
fi

# Step 2: Build TypeScript (all layers)
CLI_PATH="dist/ts/layer5/UcpCLI.js"

if [ "$FORCE" = "true" ]; then
    if [ "$VERBOSE" = "true" ]; then
        echo "Force building @web4x/ucp..."
    fi
    rm -rf "$COMPONENT_DIR/dist/ts"
    (cd "$COMPONENT_DIR" && npx tsc)
elif [ ! -f "$COMPONENT_DIR/$CLI_PATH" ] || \
     find "$COMPONENT_DIR/src/ts" -name "*.ts" -newer "$COMPONENT_DIR/$CLI_PATH" 2>/dev/null | grep -q .; then
    if [ "$VERBOSE" = "true" ]; then
        echo "Building @web4x/ucp (changes detected)..."
    else
        echo "Building @web4x/ucp..." >&2
    fi
    (cd "$COMPONENT_DIR" && npx tsc)
else
    if [ "$VERBOSE" = "true" ]; then
        echo "@web4x/ucp is up to date"
    fi
fi

echo "Build complete"
