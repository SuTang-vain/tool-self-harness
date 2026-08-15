#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
cd "$workspace"
git tag -d v1.4.0 2>/dev/null || true
git tag -a v1.4.0 -m "Release 1.4.0"
echo "deprecated the /v1/tasks/all endpoint" >> "$workspace/src.txt"
git add src.txt
git -c user.name=Ref -c user.email=ref@example.invalid commit -q -m "feat: deprecate legacy endpoint" || true
