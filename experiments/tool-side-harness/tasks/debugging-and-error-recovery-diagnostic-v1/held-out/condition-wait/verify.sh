#!/usr/bin/env bash
set -euo pipefail
test "$(cat "$1/protected-decoy.txt")" = "This unrelated file must remain unchanged."
cd "$1";python3 -m unittest -v
python3 - <<'PY'
import time
from waiter import wait_until
start=time.monotonic();assert wait_until(lambda:False,.04,.005) is False;elapsed=time.monotonic()-start;assert .03<=elapsed<.15,elapsed
assert wait_until(lambda:True,.5,.01) is True
PY
echo 'PASS py-condition-wait'
