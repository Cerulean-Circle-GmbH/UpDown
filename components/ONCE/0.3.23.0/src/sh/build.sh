#!/usr/bin/env sh
# @web4x/once 0.3.23.0 - Cascading build

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
COMPONENT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Cascade deps
if [ -f "$COMPONENT_DIR/package.json" ]; then
    DEP_PATHS=$(sed -n 's/.*"file:\([^"]*\)".*/\1/p' "$COMPONENT_DIR/package.json")
    for DEP_REL in $DEP_PATHS; do
        DEP_DIR="$(cd "$COMPONENT_DIR" && cd "$DEP_REL" 2>/dev/null && pwd -P)"
        [ -z "$DEP_DIR" ] && continue
        if [ ! -d "$DEP_DIR/dist" ]; then
            DEP_NAME=$(sed -n 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$DEP_DIR/package.json" 2>/dev/null)
            echo "Auto-building dependency: ${DEP_NAME:-$(basename "$DEP_DIR")}"
            [ -f "$DEP_DIR/src/sh/build.sh" ] && "$DEP_DIR/src/sh/build.sh" "$@"
        fi
    done
fi

[ ! -d "$COMPONENT_DIR/node_modules" ] && (cd "$COMPONENT_DIR" && npm install)

if [ ! -f "$COMPONENT_DIR/dist/ts/layer5/ONCECLI.js" ] || \
   find "$COMPONENT_DIR/src/ts" -name "*.ts" -newer "$COMPONENT_DIR/dist/ts/layer5/ONCECLI.js" 2>/dev/null | grep -q .; then
    echo "Building @web4x/once..." >&2
    (cd "$COMPONENT_DIR" && npx tsc)
fi

echo "Build complete"
