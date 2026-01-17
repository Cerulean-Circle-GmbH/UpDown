#!/usr/bin/env sh
# Web4TSComponent 0.3.22.4 - Single-stage build using @web4x/once dependency
# @pdca 2026-01-16-UTC-1202.standalone-once-wrapper-architecture.pdca.md
#
# Build flow:
# 1. Ensure @web4x/once dependency is built
# 2. Build local Web4TSComponentCLI.ts

# Parse flags (support any order)
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
ONCE_DIR="$COMPONENT_DIR/../../ONCE/0.3.22.2"

# Step 1: Ensure @web4x/once dependency is built
if [ ! -f "$ONCE_DIR/dist/ts/layer5/ONCECLI.js" ]; then
    echo "📦 Building @web4x/once dependency..."
    (cd "$ONCE_DIR" && ./src/sh/build.sh)
    if [ $? -ne 0 ]; then
        echo "❌ Failed to build @web4x/once dependency"
        exit 1
    fi
fi

# Step 2: Ensure node_modules/@web4x/once exists (npm install)
if [ ! -d "$COMPONENT_DIR/node_modules/@web4x/once" ]; then
    echo "📦 Installing dependencies..."
    (cd "$COMPONENT_DIR" && npm install)
fi

# Step 3: Build local TypeScript (only Web4TSComponentCLI.ts)
if [ "$FORCE" = "true" ]; then
    if [ "$VERBOSE" = "true" ]; then
        echo "🔧 Force building Web4TSComponent..."
    fi
    rm -rf "$COMPONENT_DIR/dist/ts"
    (cd "$COMPONENT_DIR" && npx tsc)
elif [ ! -f "$COMPONENT_DIR/dist/ts/layer5/Web4TSComponentCLI.js" ] || \
     [ "$COMPONENT_DIR/src/ts/layer5/Web4TSComponentCLI.ts" -nt "$COMPONENT_DIR/dist/ts/layer5/Web4TSComponentCLI.js" ]; then
    if [ "$VERBOSE" = "true" ]; then
        echo "🔧 Building Web4TSComponent (changes detected)..."
    else
        echo "✅ Building Web4TSComponent..." >&2
    fi
    (cd "$COMPONENT_DIR" && npx tsc)
else
    if [ "$VERBOSE" = "true" ]; then
        echo "✅ Web4TSComponent is up to date"
    fi
fi

echo "✅ Build complete"
