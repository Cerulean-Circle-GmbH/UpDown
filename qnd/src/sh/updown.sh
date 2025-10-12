#!/bin/bash

# UpDown Game Launcher with Interactive TUI
# Starts the server in foreground with Terminal UI

PORT=3443
HTTP_PORT=3000
URL="https://localhost:$PORT/ts"

echo "🎴 Starting UpDown game with TUI..."
echo "🌐 Opening browser in 2 seconds..."
echo ""

# Kill any existing server on the ports
lsof -ti:$PORT | xargs kill -9 2>/dev/null
lsof -ti:$HTTP_PORT | xargs kill -9 2>/dev/null

# Navigate to qnd/ root
cd "$(dirname "$0")/../.."

# Open browser in background after brief delay
(
  sleep 2
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL" 2>/dev/null
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$URL" 2>/dev/null || sensible-browser "$URL" 2>/dev/null
  fi
) &

# Start server in FOREGROUND (so TUI is visible)
npx -y tsx src/ts/server/server.ts

