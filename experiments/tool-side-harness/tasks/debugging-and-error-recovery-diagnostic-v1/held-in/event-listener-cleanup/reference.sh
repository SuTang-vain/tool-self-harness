#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('subscription.js')
s=p.read_text().replace("emitter.off('close',onData)", "emitter.off('data',onData)")
p.write_text(s)
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-in/event-listener-cleanup/verify.sh" "$1" "${2:-}"
