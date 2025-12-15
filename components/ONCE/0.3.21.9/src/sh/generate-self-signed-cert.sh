#!/bin/bash
#
# generate-self-signed-cert.sh
#
# Generates self-signed TLS certificates for development HTTPS
#
# Usage: ./generate-self-signed-cert.sh [output-dir] [hostname]
#
# @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
#

set -e

# Defaults
OUTPUT_DIR="${1:-./certs}"
HOSTNAME="${2:-$(hostname)}"
DAYS_VALID=365

# Resolve OUTPUT_DIR to absolute path
if [[ ! "$OUTPUT_DIR" = /* ]]; then
    OUTPUT_DIR="$(pwd)/$OUTPUT_DIR"
fi

# Certificate file paths
KEY_FILE="$OUTPUT_DIR/server.key"
CERT_FILE="$OUTPUT_DIR/server.crt"
CSR_FILE="$OUTPUT_DIR/server.csr"
CONFIG_FILE="$OUTPUT_DIR/openssl.cnf"

echo "🔐 Generating self-signed TLS certificate..."
echo "   Output dir: $OUTPUT_DIR"
echo "   Hostname: $HOSTNAME"
echo "   Valid for: $DAYS_VALID days"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate OpenSSL config with SANs for localhost and hostname
cat > "$CONFIG_FILE" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req
req_extensions = v3_req

[dn]
C = DE
ST = Development
L = Local
O = ONCE Development
OU = Web4
CN = $HOSTNAME

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = localhost
DNS.2 = $HOSTNAME
DNS.3 = *.local
DNS.4 = *.fritz.box
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out "$KEY_FILE" 2048

# Generate certificate
echo "📝 Generating self-signed certificate..."
openssl req -new -x509 \
    -key "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days "$DAYS_VALID" \
    -config "$CONFIG_FILE" \
    -extensions v3_req

# Cleanup CSR if it was created
rm -f "$CSR_FILE"

# Set permissions
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo ""
echo "✅ Self-signed certificate generated successfully!"
echo ""
echo "   Key:  $KEY_FILE"
echo "   Cert: $CERT_FILE"
echo ""
echo "📋 Certificate info:"
openssl x509 -in "$CERT_FILE" -noout -subject -dates -ext subjectAltName 2>/dev/null || \
openssl x509 -in "$CERT_FILE" -noout -subject -dates

echo ""
echo "⚠️  This is a self-signed certificate for development."
echo "   Browsers will show a security warning."
echo "   For production, use LetsEncrypt via the UI."




