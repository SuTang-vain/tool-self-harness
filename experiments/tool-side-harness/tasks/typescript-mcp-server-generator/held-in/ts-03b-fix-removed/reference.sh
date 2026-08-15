#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$workspace/src"
cp "$here"/input/package.json "$workspace"/package.json
cat > "$workspace/src/server.ts" <<'YEOF'
import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/server';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
const server = new McpServer({ name: 'demo', version: '1.0.0' });
createServer((req, res) => { res.end('ok'); }).listen(3000);
console.log(NodeStreamableHTTPServerTransport);
YEOF
