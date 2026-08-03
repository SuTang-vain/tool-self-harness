#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('registry.py')
s=p.read_text().replace('def __init__(self,tags=DEFAULT_TAGS): self.tags=tags', 'def __init__(self,tags=None): self.tags=list(DEFAULT_TAGS if tags is None else tags)')
p.write_text(s)
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-in/state-isolation/verify.sh" "$1" "${2:-}"
