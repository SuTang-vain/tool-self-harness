#!/usr/bin/env bash
set -uo pipefail
if grep -qE "SSE|WebSocket" src/server.ts; then echo "an incompatible transport is referenced"; exit 1; fi
echo "transport reference ok"
