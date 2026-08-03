#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('report.js')
s=p.read_text().replace("  writeFile(path, JSON.stringify(report, null, 2), 'utf8');", "  await writeFile(path, JSON.stringify(report, null, 2), 'utf8');")
p.write_text(s)
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-in/async-write/verify.sh" "$1" "${2:-}"
