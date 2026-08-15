#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
cp "$here"/input/test.sh "$workspace"/test.sh
bash "$here"/setup.sh "$workspace"
cd "$workspace"
git checkout -- src.txt
