#!/bin/bash
# Fix client/server vocabulary → peer/kernel terminology
# Preserve technical terms: "HTTP server", "Service Worker"

FILE="2025-11-22-UTC-2000.iteration-01.7-browser-client-kernel.pdca.md"

# Browser client → Browser kernel peer
sed -i '' 's/Browser client/Browser kernel peer/g' "$FILE"
sed -i '' 's/browser client/browser kernel peer/g' "$FILE"

# client/server → peer/kernel (generic)
sed -i '' 's/"client\/server"/"peer\/kernel"/g' "$FILE"
sed -i '' 's/client\/server/peer\/kernel/g' "$FILE"

# ONCE client → ONCE kernel
sed -i '' 's/ONCE client/ONCE kernel/g' "$FILE"

# Connected servers → Connected peers
sed -i '' 's/connected servers/connected peers/g' "$FILE"
sed -i '' 's/Connected servers/Connected peers/g' "$FILE"

# #connectedServers (DOM ID - keep as-is but note)
# We'll update code, not DOM IDs (breaking change)

# getServers → getPeers (in code contexts)
sed -i '' 's/getServers/getPeers/g' "$FILE"
sed -i '' 's/\/servers/\/peers/g' "$FILE"

# "server" → "peer" (when referring to ONCE instances)
sed -i '' 's/ server / peer /g' "$FILE"
sed -i '' 's/the server/the peer/g' "$FILE"
sed -i '' 's/a server/a peer/g' "$FILE"

# Primary server → Primary peer
sed -i '' 's/Primary server/Primary peer/g' "$FILE"
sed -i '' 's/primary server/primary peer/g' "$FILE"

# Server hierarchy → Peer hierarchy
sed -i '' 's/Server hierarchy/Peer hierarchy/g' "$FILE"
sed -i '' 's/server hierarchy/peer hierarchy/g' "$FILE"

# ONCE server → ONCE peer
sed -i '' 's/ONCE server/ONCE peer/g' "$FILE"

echo "Vocabulary fixes applied to $FILE"
