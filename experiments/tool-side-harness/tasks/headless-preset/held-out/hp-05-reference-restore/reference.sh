#!/usr/bin/env bash
# reference.sh — apply the correct hp-05 fix (restore the reference window).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
assert 'window: 7' in src
open(p, 'w').write(src.replace('window: 7', 'window: 42', 1))
PYEOF
