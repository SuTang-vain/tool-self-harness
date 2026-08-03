#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('paths.js')
s=p.read_text()
s="import path from'node:path';export function resolveWorkspace(root,requested){const base=path.resolve(root);const target=path.resolve(base,requested);if(target!==base&&!target.startsWith(base+path.sep))throw new Error('outside workspace');return target}"
p.write_text(s+'\n')
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-in/path-boundary/verify.sh" "$1" "${2:-}"
