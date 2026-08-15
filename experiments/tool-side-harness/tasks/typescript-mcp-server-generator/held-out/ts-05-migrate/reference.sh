#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$workspace/src"
cat > "$workspace/package.json" <<'YEOF'
{
  "name": "mcp-server",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/server": "^2.0.0",
    "@modelcontextprotocol/node": "^2.0.0"
  }
}
YEOF
cat > "$workspace/src/server.ts" <<'YEOF'
import { McpServer } from '@modelcontextprotocol/server';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { ProtocolError } from '@modelcontextprotocol/core';
try { throw new Error('boom'); } catch (error) {
  if (error instanceof ProtocolError) console.log(error.status);
}
console.log(NodeStreamableHTTPServerTransport);
YEOF
