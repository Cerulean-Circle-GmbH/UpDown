#!/bin/bash

# UpDown Game Stop Script
# Gracefully stops the game server

PORT=3000

echo "🛑 Stopping UpDown game server..."

# Find and kill processes on port 3000
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "ℹ️  No server running on port $PORT"
    exit 0
fi

# Kill each process
for PID in $PIDS; do
    if kill -TERM $PID 2>/dev/null; then
        echo "✅ Stopped server (PID: $PID)"
    else
        echo "⚠️  Could not stop process $PID (may require sudo)"
    fi
done

# Wait a moment and verify
sleep 1

# Check if anything is still running
REMAINING=$(lsof -ti:$PORT 2>/dev/null)
if [ -z "$REMAINING" ]; then
    echo "✅ All servers stopped successfully"
else
    echo "⚠️  Some processes may still be running. Try: sudo lsof -ti:$PORT | xargs kill -9"
fi

