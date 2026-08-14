#!/usr/bin/env bash
# reference.sh — apply the correct hp-05 fix (restore reference persistence/compaction).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
src = src.replace("root: './.sessions-broken'", "root: './.sessions'", 1)
src = src.replace("retainRatio: 0.21", "retainRatio: 0.16", 1)
assert '.sessions-broken' not in src and '0.21' not in src
open(p, 'w').write(src)
PYEOF
