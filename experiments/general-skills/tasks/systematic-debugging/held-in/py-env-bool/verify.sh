#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 -m unittest -v
python3 - <<'PY'
from config import env_bool
assert env_bool(' FALSE ') is False
assert env_bool('TrUe') is True
assert env_bool(None, True) is True
try: env_bool('maybe')
except ValueError: pass
else: raise AssertionError('ambiguous values must fail loudly')
print('PASS py-env-bool')
PY
