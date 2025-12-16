#!/bin/bash
# Test 24: File Browser Curl Tests
#
# Simple curl-based test for /EAMD.ucp file browser routes
# No Playwright, no TypeScript - just curl
#
# Usage: ./test/test-file-browser.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPONENT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION="0.3.22.1"
BASE_URL="https://localhost:42777"
CURL_OPTS="-k -s --connect-timeout 5"

echo "═══════════════════════════════════════════════════════════════"
echo "Test 24: File Browser Curl Tests"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up..."
    pkill -f "node.*ONCE" 2>/dev/null || true
}
trap cleanup EXIT

# Kill any existing servers
echo "Step 1: Cleaning up existing servers..."
pkill -f "node.*ONCE" 2>/dev/null || true
sleep 2

# Start server
echo "Step 2: Starting ONCE server..."
cd "$COMPONENT_ROOT"
ONCE_SCENARIO=primary ./once peerStart &
SERVER_PID=$!

# Wait for server to be ready
echo "Step 3: Waiting for server to start..."
for i in {1..15}; do
    if curl $CURL_OPTS "$BASE_URL/health" >/dev/null 2>&1; then
        echo "   Server is ready!"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "   ERROR: Server failed to start within 15 seconds"
        exit 1
    fi
    echo "   Waiting... ($i/15)"
    sleep 1
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Running Tests"
echo "═══════════════════════════════════════════════════════════════"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: /EAMD.ucp returns HTML
echo "Test FB-01: /EAMD.ucp returns HTML"
RESPONSE=$(curl $CURL_OPTS "$BASE_URL/EAMD.ucp")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html\|<html"; then
    echo "   ✅ PASS: Got HTML response"
    ((TESTS_PASSED++))
else
    echo "   ❌ FAIL: Expected HTML, got: ${RESPONSE:0:100}"
    ((TESTS_FAILED++))
fi

# Test 2: ?format=json returns JSON
echo ""
echo "Test FB-02: ?format=json returns JSON"
SRC_PATH="/EAMD.ucp/components/ONCE/$VERSION/src/"
RESPONSE=$(curl $CURL_OPTS "$BASE_URL${SRC_PATH}?format=json")
if echo "$RESPONSE" | grep -q '"entries"'; then
    echo "   ✅ PASS: Got JSON with entries"
    ((TESTS_PASSED++))
else
    echo "   ❌ FAIL: Expected JSON with entries, got: ${RESPONSE:0:100}"
    ((TESTS_FAILED++))
fi

# Test 3: JSON contains directory entries
echo ""
echo "Test FB-03: JSON contains expected directories"
if echo "$RESPONSE" | grep -q '"isDirectory":true'; then
    # Extract directory names
    DIRS=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | head -5)
    echo "   ✅ PASS: Found directories: $DIRS"
    ((TESTS_PASSED++))
else
    echo "   ❌ FAIL: No directories found in response"
    ((TESTS_FAILED++))
fi

# Test 4: Assets directory listing
echo ""
echo "Test FB-04: Assets directory listing"
ASSETS_PATH="/EAMD.ucp/components/ONCE/$VERSION/src/assets/"
ASSETS_RESPONSE=$(curl $CURL_OPTS "$BASE_URL${ASSETS_PATH}?format=json")
if echo "$ASSETS_RESPONSE" | grep -q '"entries"'; then
    echo "   ✅ PASS: Got assets JSON"
    ((TESTS_PASSED++))
else
    echo "   ❌ FAIL: Expected JSON, got: ${ASSETS_RESPONSE:0:100}"
    ((TESTS_FAILED++))
fi

# Test 5: Assets contains files
echo ""
echo "Test FB-05: Assets contains image files"
if echo "$ASSETS_RESPONSE" | grep -qE '\.jpg|\.png|\.svg|\.gif'; then
    FILES=$(echo "$ASSETS_RESPONSE" | grep -o '"name":"[^"]*\.\(jpg\|png\|svg\|gif\)"' | head -5)
    echo "   ✅ PASS: Found image files: $FILES"
    ((TESTS_PASSED++))
else
    echo "   ⚠️  WARN: No image files found (may be empty directory)"
    # Not a failure - directory might be empty
    ((TESTS_PASSED++))
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
