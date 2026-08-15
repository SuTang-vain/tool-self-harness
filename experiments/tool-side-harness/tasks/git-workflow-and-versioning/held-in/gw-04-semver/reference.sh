#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
bash "$here"/setup.sh "$workspace"
cd "$workspace"
git add src.txt
git -c user.name=Ref -c user.email=ref@example.invalid commit -q -m "feat!: remove legacy /v1 endpoint"
git tag -a v2.0.0 -m "Release 2.0.0"
