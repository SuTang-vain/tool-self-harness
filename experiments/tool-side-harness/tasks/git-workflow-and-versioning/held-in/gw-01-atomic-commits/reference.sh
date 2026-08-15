#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
bash "$here"/setup.sh "$workspace"
cd "$workspace"
git add src.txt && git -c user.name=Ref -c user.email=ref@example.invalid commit -q -m "feat: add endpoint validation to src"
git add util.txt && git -c user.name=Ref -c user.email=ref@example.invalid commit -q -m "chore: separate unrelated cleanup"
