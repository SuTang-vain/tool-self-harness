#!/usr/bin/env bash
# reference.sh — apply the correct ec-05 fix to a workspace (grader sanity check).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/preset.yml "$workspace"/preset.yml
cat > "$workspace"/preset.yml <<'EOF'
name: workflow-delegation
description: A preset that runs the workflow toolchain for delegation tasks.
EOF
