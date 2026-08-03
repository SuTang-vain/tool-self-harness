#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('pricing.py')
s=p.read_text().replace("    key = round(float(subtotal), 2)", "    key = (round(float(subtotal), 2), round(float(tax_rate), 2))")
p.write_text(s)
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-in/cache-key/verify.sh" "$1" "${2:-}"
