#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/package.json "$workspace"/package.json
cp "$here"/input/src/server.ts "$workspace"/src/server.ts 2>/dev/null || (mkdir -p "$workspace/src" && cp "$here"/input/src/server.ts "$workspace/src/server.ts")
mkdir -p "$workspace/src"
sed 's/StreamableHTTPServerTransport/NodeStreamableHTTPServerTransport/g' "$here"/input/src/server.ts > "$workspace/src/server.ts"
