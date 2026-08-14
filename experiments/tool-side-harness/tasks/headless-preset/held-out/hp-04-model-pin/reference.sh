#!/usr/bin/env bash
# reference.sh — apply the correct hp-04 fix (main agent back to flash).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
assert 'model: deepseek-v4-pro' in src
open(p, 'w').write(src.replace('model: deepseek-v4-pro', 'model: deepseek-v4-flash', 1))
PYEOF
