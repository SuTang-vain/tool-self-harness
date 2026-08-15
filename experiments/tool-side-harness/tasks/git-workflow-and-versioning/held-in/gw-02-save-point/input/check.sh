#!/usr/bin/env bash
set -uo pipefail
if ! git status --porcelain | grep -q .; then echo "working tree is clean"; exit 0; fi
echo "working tree has uncommitted changes"
exit 1
