#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
mkdir -p "$workspace/.worktrees"
git -C "$workspace" worktree add -q "$workspace/.worktrees/feature-existing" -b feature-existing
