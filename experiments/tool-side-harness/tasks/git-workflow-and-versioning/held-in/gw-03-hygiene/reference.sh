#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
bash "$here"/setup.sh "$workspace"
cd "$workspace"
git rm -q --cached .env
printf '.env\n' >> .gitignore
git add .gitignore
