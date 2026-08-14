#!/usr/bin/env bash
# reference.sh — apply the correct hp-01 fix (reinsert tool-todo from the frozen composition).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
python3 - "$workspace/agent.cordis.yml" <<'PYEOF'
import sys
p = sys.argv[1]
frozen = open(p).read()
row = """# `todo_write` replaces the logged whole list.
- id: tool-todo
  name: '@deepseek-ai/dsh-tool-todo'
  config:
    allowParallelInProgress: true

"""
if '- id: tool-todo' not in frozen:
    anchor = "- id: tool-ralph"
    i = frozen.index(anchor)
    frozen = frozen[:i] + row + frozen[i:]
open(p, 'w').write(frozen)
PYEOF
