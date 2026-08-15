#!/usr/bin/env bash
set -uo pipefail
if [ ! -f src/server.ts ]; then echo "src/server.ts not found"; exit 1; fi
if ! grep -q "import" src/server.ts; then echo "src/server.ts has no import statement"; exit 1; fi
echo "project structure ok"
