#!/usr/bin/env bash
# reference.sh — apply the correct hp-04 fix (re-register the flash model).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
anchor = '      - id: deepseek-v4-pro\n        contextWindow: 128000\n'
assert anchor in src
flash = '      - id: deepseek-v4-flash\n        contextWindow: 128000\n'
open(p, 'w').write(src.replace(anchor, anchor + flash, 1))
PYEOF
