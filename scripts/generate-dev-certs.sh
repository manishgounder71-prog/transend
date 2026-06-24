#!/bin/bash
# ==========================================================
# Generate Self-Signed SSL Certificates for Local Dev
# ==========================================================
# Run this once before starting docker-compose in production
# mode locally. It creates orbit.crt and orbit.key in the
# nginx/ssl/ directory.
#
# Usage: bash scripts/generate-dev-certs.sh
# ==========================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SSL_DIR="$PROJECT_DIR/nginx/ssl"

mkdir -p "$SSL_DIR"

# Only generate if certs don't already exist
if [ -f "$SSL_DIR/orbit.crt" ] && [ -f "$SSL_DIR/orbit.key" ]; then
  echo "✓ SSL certificates already exist at $SSL_DIR"
  echo "  To regenerate, delete them first: rm $SSL_DIR/orbit.crt $SSL_DIR/orbit.key"
  exit 0
fi

echo "Generating self-signed SSL certificates for local development..."
echo ""

openssl req -x509 \
  -newkey rsa:4096 \
  -keyout "$SSL_DIR/orbit.key" \
  -out "$SSL_DIR/orbit.crt" \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=Local/L=Development/O=OrbitCTOX/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo ""
echo "✓ SSL certificates created:"
echo "  Certificate: $SSL_DIR/orbit.crt"
echo "  Key:         $SSL_DIR/orbit.key"
echo ""
echo "  These certs are self-signed and valid for 365 days."
echo "  For production, replace with Let's Encrypt certificates."
