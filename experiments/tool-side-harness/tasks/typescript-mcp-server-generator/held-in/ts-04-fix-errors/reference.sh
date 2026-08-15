#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$workspace/src"
cp "$here"/input/package.json "$workspace"/package.json
cat > "$workspace/src/server.ts" <<'YEOF'
import { McpServer } from '@modelcontextprotocol/server';
import { ProtocolError } from '@modelcontextprotocol/core';
try { throw new Error('boom'); } catch (error) {
  if (error instanceof ProtocolError) console.log(error.status);
}
YEOF
