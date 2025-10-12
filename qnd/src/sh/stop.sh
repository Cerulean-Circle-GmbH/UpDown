#!/bin/bash

# UpDown Game Stop Script
# Gracefully stops the HTTPS and HTTP servers

HTTPS_PORT=3443
HTTP_PORT=3000

echo "🛑 Stopping UpDown game servers..."

# Find and kill processes on both ports
HTTPS_PIDS=$(lsof -ti:$HTTPS_PORT 2>/dev/null)
HTTP_PIDS=$(lsof -ti:$HTTP_PORT 2>/dev/null)

if [ -z "$HTTPS_PIDS" ] && [ -z "$HTTP_PIDS" ]; then
    echo "ℹ️  No servers running"
    exit 0
fi

# Kill HTTPS server
if [ -n "$HTTPS_PIDS" ]; then
    for PID in $HTTPS_PIDS; do
        if kill -TERM $PID 2>/dev/null; then
            echo "✅ Stopped HTTPS server (PID: $PID)"
        else
            echo "⚠️  Could not stop HTTPS process $PID"
        fi
    done
fi

# Kill HTTP server
if [ -n "$HTTP_PIDS" ]; then
    for PID in $HTTP_PIDS; do
        if kill -TERM $PID 2>/dev/null; then
            echo "✅ Stopped HTTP server (PID: $PID)"
        else
            echo "⚠️  Could not stop HTTP process $PID"
        fi
    done
fi

# Wait a moment and verify
sleep 1

# Check if anything is still running
HTTPS_REMAINING=$(lsof -ti:$HTTPS_PORT 2>/dev/null)
HTTP_REMAINING=$(lsof -ti:$HTTP_PORT 2>/dev/null)

if [ -z "$HTTPS_REMAINING" ] && [ -z "$HTTP_REMAINING" ]; then
    echo "✅ All servers stopped successfully"
else
    echo "⚠️  Some processes may still be running"
    [ -n "$HTTPS_REMAINING" ] && echo "   HTTPS: sudo lsof -ti:$HTTPS_PORT | xargs kill -9"
    [ -n "$HTTP_REMAINING" ] && echo "   HTTP: sudo lsof -ti:$HTTP_PORT | xargs kill -9"
fi

