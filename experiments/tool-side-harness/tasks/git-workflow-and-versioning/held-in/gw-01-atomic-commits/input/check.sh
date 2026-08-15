#!/usr/bin/env bash
set -uo pipefail
cp "$(cd "$(dirname "$0")" && pwd)/check.js" . 2>/dev/null || true
node "$(cd "$(dirname "$0")" && pwd)/check.js" "$(pwd)" "$(cd "$(dirname "$0")" && pwd)/check-expect.json"
