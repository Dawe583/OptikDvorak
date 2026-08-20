#!/usr/bin/env sh
# Kompletní export inzerátů: HTML → tiskové PDF → PNG 300 DPI
set -e
cd "$(dirname "$0")/../.."
node inzerce/trojka/render.mjs
python3 inzerce/trojka/raster.py
