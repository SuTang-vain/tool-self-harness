#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
parent=$(dirname "$workspace")
backing="$parent/backing-$(basename "$workspace")"
mv "$workspace" "$backing"
git -C "$backing" branch -M main
git -C "$backing" worktree add -q "$workspace" -b linked-feature
