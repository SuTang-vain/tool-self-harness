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
    "zod": "^4.2.0"
  }
}
YEOF
cat > "$workspace/src/server.ts" <<'YEOF'
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { ProtocolError } from '@modelcontextprotocol/core';
import { z } from 'zod';
const server = new McpServer({ name: 'demo', version: '1.0.0' });
server.registerTool('greet', { description: 'Greet user', inputSchema: z.object({ name: z.string() }) }, async ({ name }) => {
  return { content: [{ type: 'text', text: `Hello, ${name}!` }] };
});
try { throw new Error('boom'); } catch (error) {
  if (error instanceof ProtocolError) console.log(error.status);
}
console.log(StdioServerTransport);
YEOF
