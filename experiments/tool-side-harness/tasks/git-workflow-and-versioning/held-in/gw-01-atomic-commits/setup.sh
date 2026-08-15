#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
echo "feature A: added endpoint validation" >> "$workspace/src.txt"
echo "unrelated cleanup" > "$workspace/util.txt"
