#!/usr/bin/env bash
set -euo pipefail
cd "$1";python3 -m unittest -v
python3 - <<'PY'
from registry import Registry
a=Registry();b=Registry();a.add('x');assert b.tags==[];assert a.tags is not b.tags
PY
echo 'PASS py-state-polluter'
