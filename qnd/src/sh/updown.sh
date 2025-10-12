#!/bin/bash

# UpDown Game Launcher with Interactive TUI
# Starts the server in foreground with Terminal UI

PORT=3443
HTTP_PORT=3000
URL="https://localhost:$PORT/ts"

echo "🎴 Starting UpDown game with TUI..."
echo ""

# Kill any existing server on the ports
lsof -ti:$PORT | xargs kill -9 2>/dev/null
lsof -ti:$HTTP_PORT | xargs kill -9 2>/dev/null

# Navigate to qnd/ root
cd "$(dirname "$0")/../.."

# Start server in FOREGROUND (so TUI is visible)
# Use [p] key in TUI to open browser
npx -y tsx src/ts/server/server.ts

