#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
echo "broken change" >> "$workspace/src.txt"
