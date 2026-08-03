#!/usr/bin/env bash
set -euo pipefail
cd "$1"
cat > waiter.py <<'PY2'
import time

def wait_until(predicate,timeout,interval=0.01):
    deadline=time.monotonic()+timeout
    while True:
        if predicate():
            return True
        remaining=deadline-time.monotonic()
        if remaining<=0:
            return False
        time.sleep(min(interval,remaining))
PY2
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-out/condition-wait/verify.sh" "$1" "${2:-}"
