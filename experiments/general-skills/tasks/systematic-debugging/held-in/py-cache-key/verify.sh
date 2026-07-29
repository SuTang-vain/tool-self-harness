#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 -m unittest -v
python3 - <<'PY'
import pricing
pricing.clear_cache()
assert pricing.total_with_tax(10.125, .08) == 10.94
assert pricing.total_with_tax(10.125, .21) == 12.25
print('PASS py-cache-key')
PY
