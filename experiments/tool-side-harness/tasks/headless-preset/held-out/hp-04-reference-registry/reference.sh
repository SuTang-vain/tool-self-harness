#!/usr/bin/env bash
# reference.sh — apply the correct hp-04 fix (restore the reference model registry).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
src = src.replace("""      - id: deepseek-v4-turbo
        contextWindow: 128000""",
"""      - id: deepseek-v4-pro
        contextWindow: 128000
      - id: deepseek-v4-flash
        contextWindow: 128000""", 1)
src = src.replace("model: deepseek-v4-turbo", "model: deepseek-v4-flash", 1)
assert 'deepseek-v4-turbo' not in src
open(p, 'w').write(src)
PYEOF
