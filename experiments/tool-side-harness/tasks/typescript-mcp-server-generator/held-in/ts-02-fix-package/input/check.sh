#!/usr/bin/env bash
set -uo pipefail
if grep -q "@modelcontextprotocol/sdk" package.json src/server.ts 2>/dev/null; then echo "the retired monolithic package is still referenced"; exit 1; fi
echo "dependency structure ok"
