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
    "@modelcontextprotocol/server": "^2.0.0"
  }
}
YEOF
sed 's|@modelcontextprotocol/sdk/server/index.js|@modelcontextprotocol/server|g' "$here"/input/src/server.ts > "$workspace/src/server.ts"
