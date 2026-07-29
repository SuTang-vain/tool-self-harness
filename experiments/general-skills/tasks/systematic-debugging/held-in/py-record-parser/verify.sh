#!/usr/bin/env bash
set -euo pipefail
cd "$1";python3 -m unittest -v
python3 - <<'PY'
from parser import parse_records
assert parse_records('\n a : x \n\n')==[('a','x')]
try:parse_records('broken')
except ValueError:pass
else:raise AssertionError('malformed row accepted')
PY
echo 'PASS py-record-parser'
