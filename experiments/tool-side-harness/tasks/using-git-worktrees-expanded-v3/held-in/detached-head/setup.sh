#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
git -C "$workspace" checkout -q --detach HEAD
git_dir=$(git -C "$workspace" rev-parse --absolute-git-dir)
git -C "$workspace" rev-parse HEAD > "$git_dir/fixture-source-head"
