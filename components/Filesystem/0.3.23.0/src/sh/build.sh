#!/usr/bin/env sh
# @web4x/filesystem 0.3.23.0 - Cascading build

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

# Step 1: Cascade — auto-build file: dependencies
if [ -f "$COMPONENT_DIR/package.json" ]; then
    DEP_PATHS=$(sed -n 's/.*"file:\([^"]*\)".*/\1/p' "$COMPONENT_DIR/package.json")
    for DEP_REL in $DEP_PATHS; do
        DEP_DIR="$(cd "$COMPONENT_DIR" && cd "$DEP_REL" 2>/dev/null && pwd -P)"
        if [ -z "$DEP_DIR" ]; then
            echo "Warning: Dependency path not found: $DEP_REL"
            continue
        fi
        DEP_NAME=$(sed -n 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$DEP_DIR/package.json" 2>/dev/null)
        DEP_NAME="${DEP_NAME:-$(basename "$DEP_DIR")}"
        if [ ! -d "$DEP_DIR/dist" ] || [ "$FORCE" = "true" ]; then
            echo "Auto-building dependency: $DEP_NAME"
            if [ -f "$DEP_DIR/src/sh/build.sh" ]; then
                "$DEP_DIR/src/sh/build.sh" "$@"
            else
                echo "Warning: No build.sh found for $DEP_NAME at $DEP_DIR"
            fi
        else
            if [ "$VERBOSE" = "true" ]; then
                echo "Dependency $DEP_NAME is already built"
            fi
        fi
    done
fi

# Step 2: Ensure node_modules exists
if [ ! -d "$COMPONENT_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    (cd "$COMPONENT_DIR" && npm install)
fi

# Step 3: Build TypeScript
CLI_PATH="dist/ts/layer2/DefaultFileSystem.js"

if [ "$FORCE" = "true" ]; then
    if [ "$VERBOSE" = "true" ]; then
        echo "Force building @web4x/filesystem..."
    fi
    rm -rf "$COMPONENT_DIR/dist/ts"
    (cd "$COMPONENT_DIR" && npx tsc)
elif [ ! -f "$COMPONENT_DIR/$CLI_PATH" ] || \
     find "$COMPONENT_DIR/src/ts" -name "*.ts" -newer "$COMPONENT_DIR/$CLI_PATH" 2>/dev/null | grep -q .; then
    if [ "$VERBOSE" = "true" ]; then
        echo "Building @web4x/filesystem (changes detected)..."
    else
        echo "Building @web4x/filesystem..." >&2
    fi
    (cd "$COMPONENT_DIR" && npx tsc)
else
    if [ "$VERBOSE" = "true" ]; then
        echo "@web4x/filesystem is up to date"
    fi
fi

echo "Build complete"
