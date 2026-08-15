#!/usr/bin/env bash
set -uo pipefail
if ! grep -q "^import" src/server.ts; then echo "src/server.ts has no import statement"; exit 1; fi
echo "import structure ok"
