#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
bash "$here"/setup.sh "$workspace"
cd "$workspace"
git checkout -q -b fix/duplicate-tasks
git add src.txt
git -c user.name=Ref -c user.email=ref@example.invalid commit -q -m "fix: deduplicate tasks on load"
