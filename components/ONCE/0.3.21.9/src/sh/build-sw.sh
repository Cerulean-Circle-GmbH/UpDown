#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# build-sw.sh - Bundle Service Worker for browser compatibility
# 
# Service Workers cannot use ES module imports in most browsers.
# This script bundles OnceServiceWorker.ts into a single sw.js file.
#
# @pdca 2025-12-12-UTC-1730.service-worker-fix.pdca.md
# ═══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPONENT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPONENT_ROOT="$(dirname "$COMPONENT_ROOT")"

echo "🔧 Building Service Worker bundle..."

# Check if esbuild is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js."
    exit 1
fi

# Create dist directory if it doesn't exist
mkdir -p "$COMPONENT_ROOT/dist"

# Bundle OnceServiceWorker.ts into a single sw.js file
# - --bundle: Include all dependencies
# - --format=iife: Immediately Invoked Function Expression (browser compatible)
# - --target=es2020: Modern browser target
# - --platform=browser: Browser environment
npx esbuild "$COMPONENT_ROOT/src/ts/layer2/OnceServiceWorker.ts" \
    --bundle \
    --format=iife \
    --target=es2020 \
    --platform=browser \
    --outfile="$COMPONENT_ROOT/dist/sw.js" \
    --define:process.env.NODE_ENV=\"production\" \
    --minify=false \
    2>&1

if [ $? -eq 0 ]; then
    echo "✅ Service Worker bundled: dist/sw.js"
    # Show file size
    ls -lh "$COMPONENT_ROOT/dist/sw.js" | awk '{print "   Size: " $5}'
else
    echo "❌ Service Worker bundling failed"
    exit 1
fi



