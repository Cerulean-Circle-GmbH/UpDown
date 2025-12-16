#!/bin/bash
# Trust the development self-signed certificate on macOS
# This allows Service Workers to work with HTTPS on self-signed certs

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_PATH="$SCRIPT_DIR/../certs/server.crt"

if [ ! -f "$CERT_PATH" ]; then
    echo "❌ Certificate not found at: $CERT_PATH"
    exit 1
fi

echo "🔐 Adding development certificate to macOS Keychain..."
echo "   Certificate: $CERT_PATH"
echo ""
echo "⚠️  You will be prompted for your password to trust this certificate."
echo ""

# Add to login keychain and set as trusted for SSL
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificate trusted successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Restart your browser completely (quit and reopen)"
    echo "   2. Navigate to https://localhost:42777 or your dev URL"
    echo "   3. Service Worker should now register without SSL errors"
else
    echo ""
    echo "❌ Failed to trust certificate. Try manually:"
    echo "   1. Open Keychain Access"
    echo "   2. Drag $CERT_PATH into 'login' keychain"
    echo "   3. Double-click the cert, expand 'Trust', set SSL to 'Always Trust'"
fi



