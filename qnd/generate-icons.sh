#!/bin/bash

# Generate PWA icons for UpDown game
# Uses base64-encoded SVG converted to PNG

PUBLIC_DIR="$(dirname "$0")/public"

# Create a simple SVG icon
SVG_CONTENT='<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)" rx="80"/>
  <text x="256" y="360" font-size="280" text-anchor="middle" fill="white">🎴</text>
</svg>'

# Save SVG
echo "$SVG_CONTENT" > "$PUBLIC_DIR/icon.svg"

echo "✅ Created icon.svg"
echo ""
echo "To generate PNG icons, use one of these methods:"
echo ""
echo "1. ImageMagick:"
echo "   convert -background none icon.svg -resize 192x192 icon-192.png"
echo "   convert -background none icon.svg -resize 512x512 icon-512.png"
echo ""
echo "2. Online tool:"
echo "   Upload icon.svg to https://realfavicongenerator.net/"
echo ""
echo "3. macOS Preview:"
echo "   Open icon.svg in Preview and export as PNG"
echo ""

