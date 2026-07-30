#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
printf 'local uncommitted operator change\n' >> "$workspace/config.txt"
