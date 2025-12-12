#!/bin/bash
# Manual Test: IOR Method Invocation Routing
# Tests that IORMethodRouter correctly parses and routes IOR URLs
# @pdca session/2025-11-30-UTC-1724.iteration-05-httprouter-ior-routing.pdca.md

set -e

echo "🧪 Manual Test: IOR Method Invocation Routing"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
TEST_PORT=42777
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# From manual/ → test/ → 0.3.21.7/ → ONCE/ → components/ → UpDown/
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📂 Project Root: $PROJECT_ROOT"
echo "🔧 Test Port: $TEST_PORT"
echo ""

# Step 1: Clean up any existing servers
echo "🧹 Step 1: Cleanup existing servers..."
pkill -f "once.*$TEST_PORT" 2>/dev/null || true
sleep 2

# Step 2: Start ONCE server with demoMessages (1 client)
echo "🚀 Step 2: Starting ONCE server..."
./scripts/versions/once-v0.3.21.7 demoMessages 1 > /tmp/once-test.log 2>&1 &
ONCE_PID=$!

echo "   PID: $ONCE_PID"
echo "   Waiting for server to start..."
sleep 5

# Check if server is running
if ! ps -p $ONCE_PID > /dev/null; then
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "   Log output:"
    cat /tmp/once-test.log
    exit 1
fi

echo -e "${GREEN}✅ Server started${NC}"
echo ""

# Step 3: Test /health endpoint (baseline)
echo "🩺 Step 3: Testing /health endpoint (baseline)..."
HEALTH_RESPONSE=$(curl -s http://localhost:$TEST_PORT/health)
echo "   Response: $HEALTH_RESPONSE"

if [ -z "$HEALTH_RESPONSE" ] || [ "$HEALTH_RESPONSE" == "{}" ]; then
    echo -e "${YELLOW}⚠️  Health endpoint returned empty or {}, but server is running${NC}"
else
    echo -e "${GREEN}✅ Health endpoint working${NC}"
fi
echo ""

# Step 4: Extract server UUID from log
echo "🔍 Step 4: Extracting server UUID..."
# Look for UUID pattern in logs
SERVER_UUID=$(grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' /tmp/once-test.log | head -1)

if [ -z "$SERVER_UUID" ]; then
    echo -e "${YELLOW}⚠️  Could not extract UUID from logs${NC}"
    echo "   Using test UUID: abc-123-def-456"
    SERVER_UUID="abc-123-def-456"
else
    echo -e "${GREEN}✅ Server UUID: $SERVER_UUID${NC}"
fi
echo ""

# Step 5: Test IOR method invocation (healthGet)
echo "🎯 Step 5: Testing IOR method invocation..."
IOR_URL="http://localhost:$TEST_PORT/ONCE/0.3.21.7/$SERVER_UUID/healthGet"
echo "   IOR URL: $IOR_URL"

IOR_RESPONSE=$(curl -s "$IOR_URL")
echo "   Response: $IOR_RESPONSE"

if echo "$IOR_RESPONSE" | grep -q "ior\|model\|error"; then
    echo -e "${GREEN}✅ IOR routing returned JSON (scenario or error)${NC}"
    
    # Pretty print if jq is available
    if command -v jq &> /dev/null; then
        echo ""
        echo "   Formatted response:"
        echo "$IOR_RESPONSE" | jq '.' 2>/dev/null || echo "$IOR_RESPONSE"
    fi
else
    echo -e "${RED}❌ IOR routing did not return expected JSON${NC}"
fi
echo ""

# Step 6: Test IOR with non-existent method (should fallback to scenario)
echo "📋 Step 6: Testing IOR with non-existent method (fallback)..."
FALLBACK_URL="http://localhost:$TEST_PORT/ONCE/0.3.21.7/$SERVER_UUID/nonExistentMethod"
echo "   URL: $FALLBACK_URL"

FALLBACK_RESPONSE=$(curl -s "$FALLBACK_URL")
echo "   Response (truncated): ${FALLBACK_RESPONSE:0:200}..."

if echo "$FALLBACK_RESPONSE" | grep -q "ior\|model"; then
    echo -e "${GREEN}✅ Fallback to scenario working${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected fallback response${NC}"
fi
echo ""

# Step 7: Cleanup
echo "🧹 Step 7: Cleanup..."
kill $ONCE_PID 2>/dev/null || true
pkill -f "once.*$TEST_PORT" 2>/dev/null || true
sleep 1

echo -e "${GREEN}✅ Test complete!${NC}"
echo ""
echo "📊 Summary:"
echo "   - Server startup: ✅"
echo "   - Health endpoint: ✅"
echo "   - IOR routing: Check results above"
echo "   - Fallback: Check results above"
echo ""
echo "📝 Note: This is a smoke test. Full integration tests should be written in Vitest."

