#!/usr/bin/env bash
set -uo pipefail
if grep -q "McpError" src/server.ts; then echo "a retired error class is still referenced"; exit 1; fi
echo "error class structure ok"
