#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
cd "$workspace"
git tag -d v1.4.0 2>/dev/null || true
git tag -a v1.4.0 -m "Release 1.4.0"
echo "fixed the timezone drift in recurring tasks" >> "$workspace/src.txt"
git add src.txt
git -c user.name=Ref -c user.email=ref@example.invalid commit -q -m "fix: timezone drift in recurring task due dates"
