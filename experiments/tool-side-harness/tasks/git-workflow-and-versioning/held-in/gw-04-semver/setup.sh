#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
cd "$workspace"
git tag -a v1.4.0 -m "Release 1.4.0"
echo "removed the legacy /v1 endpoint (breaking change)" >> "$workspace/src.txt"
