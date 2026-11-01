#!/usr/bin/env bash
# Outputs dist-extension/ (Load unpacked) and public/vaktiaks-extension.zip.
set -e
cd "$(dirname "$0")/.."
rm -rf dist-extension && cp -r extension dist-extension
echo "export default $(cat src/lib/bik-times.json);" > dist-extension/bik-times.js
bun build src/lib/albania-times.ts --format esm --outfile dist-extension/albania-times.js >/dev/null
cp public/vaktiaks-icon-192.png dist-extension/icon-192.png
cp public/vaktiaks-icon-512.png dist-extension/icon-512.png
rm -f public/vaktiaks-extension.zip
(cd dist-extension && (command -v zip >/dev/null && zip -qr ../public/vaktiaks-extension.zip . || nix run nixpkgs#zip -- -qr ../public/vaktiaks-extension.zip .))
echo "Extension ready in dist-extension/"
