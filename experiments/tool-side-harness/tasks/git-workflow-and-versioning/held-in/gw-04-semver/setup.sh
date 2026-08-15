#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
cd "$workspace"
git tag -d v1.4.0 2>/dev/null || true
git tag -a v1.4.0 -m "Release 1.4.0"
echo "changed the response shape consumers relied on" >> "$workspace/src.txt"
