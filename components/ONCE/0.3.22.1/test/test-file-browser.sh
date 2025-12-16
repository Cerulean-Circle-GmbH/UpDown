#!/bin/bash
# Test24: File Browser Curl Tests
# Simple curl-based tests for /EAMD.ucp file browser routes
# Run: ./test/test-file-browser.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPONENT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION="0.3.22.1"
PORT=42777
BASE_URL="https://localhost:$PORT"

echo "═══════════════════════════════════════════════════════════════"
echo "Test24: File Browser Curl Tests"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up..."
    pkill -f "node.*ONCE" 2>/dev/null || true
}

trap cleanup EXIT

# Kill any existing ONCE processes
echo "Step 1: Killing existing ONCE processes..."
pkill -f "node.*ONCE" 2>/dev/null || true
sleep 2

# Start server
echo "Step 2: Starting ONCE server..."
cd "$COMPONENT_ROOT"
ONCE_SCENARIO=primary ./once peerStart &
SERVER_PID=$!

# Wait for server to start
echo "Step 3: Waiting for server to be ready..."
for i in {1..20}; do
    if curl -k -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo "   Server is ready!"
        break
    fi
    echo "   Waiting... ($i/20)"
    sleep 1
done

# Verify server is running
if ! curl -k -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo "❌ FAILED: Server did not start"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Running Tests"
echo "═══════════════════════════════════════════════════════════════"
echo ""

PASSED=0
FAILED=0

# Test 1: /EAMD.ucp returns HTML
echo "Test FB-01: /EAMD.ucp returns HTML"
RESPONSE=$(curl -k -s "$BASE_URL/EAMD.ucp")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html\|<html"; then
    echo "   ✅ PASSED: Response contains HTML"
    ((PASSED++))
else
    echo "   ❌ FAILED: Response does not contain HTML"
    echo "   Response: ${RESPONSE:0:200}"
    ((FAILED++))
fi

# Test 2: ?format=json returns JSON
echo "Test FB-02: ?format=json returns JSON"
SRC_PATH="/EAMD.ucp/components/ONCE/$VERSION/src/"
RESPONSE=$(curl -k -s "${BASE_URL}${SRC_PATH}?format=json")
if echo "$RESPONSE" | grep -q '"entries"'; then
    echo "   ✅ PASSED: Response contains JSON entries"
    ((PASSED++))
else
    echo "   ❌ FAILED: Response does not contain JSON entries"
    echo "   Response: ${RESPONSE:0:300}"
    ((FAILED++))
fi

# Test 3: JSON has entries array
echo "Test FB-03: JSON has entries array with directories"
if echo "$RESPONSE" | grep -q '"isDirectory":true'; then
    echo "   ✅ PASSED: JSON contains directory entries"
    ((PASSED++))
else
    echo "   ❌ FAILED: JSON does not contain directory entries"
    ((FAILED++))
fi

# Test 4: Assets directory returns JSON
echo "Test FB-04: Assets directory returns JSON"
ASSETS_PATH="/EAMD.ucp/components/ONCE/$VERSION/src/assets/"
ASSETS_RESPONSE=$(curl -k -s "${BASE_URL}${ASSETS_PATH}?format=json")
if echo "$ASSETS_RESPONSE" | grep -q '"entries"'; then
    echo "   ✅ PASSED: Assets response contains JSON entries"
    ((PASSED++))
else
    echo "   ❌ FAILED: Assets response does not contain JSON entries"
    echo "   Response: ${ASSETS_RESPONSE:0:300}"
    ((FAILED++))
fi

# Test 5: Assets contains files
echo "Test FB-05: Assets contains files"
if echo "$ASSETS_RESPONSE" | grep -q '"isFile":true'; then
    echo "   ✅ PASSED: Assets contains file entries"
    ((PASSED++))
else
    echo "   ❌ FAILED: Assets does not contain file entries"
    ((FAILED++))
fi

# Test 6: Deep path without ?format=json returns HTML (not JSON)
echo "Test FB-06: Deep path returns HTML (SPA)"
DEEP_PATH="/EAMD.ucp/components/ONCE/$VERSION/src/assets/"
DEEP_RESPONSE=$(curl -k -s "${BASE_URL}${DEEP_PATH}")
if echo "$DEEP_RESPONSE" | grep -q "<!DOCTYPE html\|<html"; then
    echo "   ✅ PASSED: Deep path returns HTML (SPA)"
    ((PASSED++))
else
    echo "   ❌ FAILED: Deep path does not return HTML"
    echo "   Response: ${DEEP_RESPONSE:0:200}"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Results"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ ALL TESTS PASSED"
    exit 0
else
    echo "❌ SOME TESTS FAILED"
    exit 1
fi
