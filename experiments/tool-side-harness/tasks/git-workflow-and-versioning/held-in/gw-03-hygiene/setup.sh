#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
echo "app change" >> "$workspace/src.txt"
printf 'SECRET=do-not-commit\n' > "$workspace/.env"
cd "$workspace"
git add src.txt .env
