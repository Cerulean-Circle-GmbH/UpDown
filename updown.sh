#!/bin/bash

# UpDown Game Launcher
# Starts the server and opens the browser

PORT=3000
URL="http://localhost:$PORT"

echo "🎴 Starting UpDown game..."

# Kill any existing server on the port
lsof -ti:$PORT | xargs kill -9 2>/dev/null

# Start the server in the background
cd "$(dirname "$0")/public"
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 1

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
    echo "❌ Failed to start server"
    exit 1
fi

echo "✅ Server started on $URL (PID: $SERVER_PID)"

# Open browser based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🌐 Opening browser..."
    open "$URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🌐 Opening browser..."
    xdg-open "$URL" 2>/dev/null || sensible-browser "$URL" 2>/dev/null
else
    echo "🌐 Please open your browser to: $URL"
fi

echo ""
echo "Game is running! Press Ctrl+C to stop the server."
echo ""

# Keep script running and handle Ctrl+C
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; exit 0" INT TERM

# Wait for the server process
wait $SERVER_PID

