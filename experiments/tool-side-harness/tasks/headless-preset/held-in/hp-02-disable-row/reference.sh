#!/usr/bin/env bash
# reference.sh — apply the correct hp-02 fix (disable tool-ralph).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
assert '- id: tool-ralph' in src
src = src.replace('- id: tool-ralph\n  name:', '- id: tool-ralph\n  disabled: true\n  name:', 1)
open(p, 'w').write(src)
PYEOF
