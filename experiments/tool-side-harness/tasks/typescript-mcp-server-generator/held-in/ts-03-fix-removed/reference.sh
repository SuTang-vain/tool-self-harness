#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$workspace/src"
cp "$here"/input/package.json "$workspace"/package.json
cat > "$workspace/src/server.ts" <<'YEOF'
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
const server = new McpServer({ name: 'demo', version: '1.0.0' });
console.log(StdioServerTransport);
YEOF
