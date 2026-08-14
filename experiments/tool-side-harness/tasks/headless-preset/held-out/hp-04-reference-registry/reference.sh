#!/usr/bin/env bash
# reference.sh — apply the correct hp-04 fix (restore the reference pin).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
assert 'eval-pin-9999' in src
open(p, 'w').write(src.replace('eval-pin-9999', 'eval-pin-7f3a', 1))
PYEOF
