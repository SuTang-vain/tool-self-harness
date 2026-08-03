#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('request.js')
s=p.read_text()
s=s.replace('options.retries||3', "('retries' in options?options.retries:3)")
s=s.replace('options.timeout||5000', "('timeout' in options?options.timeout:5000)")
s=s.replace('options.verbose||false', "('verbose' in options?options.verbose:false)")
p.write_text(s)
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-out/options-defaults/verify.sh" "$1" "${2:-}"
