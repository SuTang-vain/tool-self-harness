#!/usr/bin/env bash
# reference.sh — apply the correct hp-03 fix (thresholdRatio 0.9 -> 0.8).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
assert 'thresholdRatio: 0.9' in src
open(p, 'w').write(src.replace('thresholdRatio: 0.9', 'thresholdRatio: 0.8', 1))
PYEOF
