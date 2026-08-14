#!/usr/bin/env bash
# reference.sh — apply the correct hp-05 fix (maxDepth back to a positive bound).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
assert 'maxDepth: 0' in src
open(p, 'w').write(src.replace('maxDepth: 0', 'maxDepth: 1', 1))
PYEOF
