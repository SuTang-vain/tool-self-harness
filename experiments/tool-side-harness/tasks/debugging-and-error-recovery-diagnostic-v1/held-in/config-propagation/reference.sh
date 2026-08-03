#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('client.go')
s=p.read_text()
s=s.replace('func NewClient(cfg Config)*Client{return newHTTPClient()}', 'func NewClient(cfg Config)*Client{return newHTTPClient(cfg)}')
s=s.replace('func newHTTPClient()*Client{return &Client{Timeout:30*time.Second}}', 'func newHTTPClient(cfg Config)*Client{return &Client{Timeout:cfg.Timeout}}')
p.write_text(s)
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-in/config-propagation/verify.sh" "$1" "${2:-}"
