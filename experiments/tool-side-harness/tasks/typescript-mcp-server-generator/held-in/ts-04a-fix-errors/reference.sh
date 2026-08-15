#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$workspace/src"
cp "$here"/input/package.json "$workspace"/package.json
cat > "$workspace/src/server.ts" <<'YEOF'
import { McpServer } from '@modelcontextprotocol/server';
import { SdkError } from '@modelcontextprotocol/server';
try { throw new Error('boom'); } catch (error) {
  if (error instanceof SdkError) console.log(error.status);
}
YEOF
