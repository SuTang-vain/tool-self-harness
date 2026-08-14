#!/usr/bin/env bash
# reference.sh — apply the correct hp-02 fix (restore the package name).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
src = open(p).read()
assert '@deepseek-ai/dsh-todo-tool' in src
open(p, 'w').write(src.replace('@deepseek-ai/dsh-todo-tool', '@deepseek-ai/dsh-tool-todo', 1))
PYEOF
