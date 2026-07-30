#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
git -C "$workspace" branch feature-reports
git_dir=$(git -C "$workspace" rev-parse --absolute-git-dir)
git -C "$workspace" rev-parse feature-reports > "$git_dir/fixture-branch-head"
