#!/usr/bin/env bash
# reference.sh — apply the correct hp-05 fix (one-shot/exit description).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/preset.yml "$workspace"/preset.yml
cat > "$workspace"/preset.yml <<'YEOF'
name: Headless Agent
description: One-shot coding agent that accepts one task, runs, prints the final answer, and exits.
YEOF
