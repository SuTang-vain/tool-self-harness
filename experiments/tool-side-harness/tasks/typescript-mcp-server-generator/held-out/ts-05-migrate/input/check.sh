#!/usr/bin/env bash
set -uo pipefail
if grep -q "@modelcontextprotocol/sdk" package.json src/server.ts 2>/dev/null; then echo "retired package still referenced"; exit 1; fi
if grep -qE "SSE|WebSocket|McpError" src/server.ts; then echo "retired transport/error still referenced"; exit 1; fi
echo "migration structure ok"
