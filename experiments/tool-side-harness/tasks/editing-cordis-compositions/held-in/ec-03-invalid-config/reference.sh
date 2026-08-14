#!/usr/bin/env bash
# reference.sh — apply the correct ec-03 fix to a workspace (grader sanity check).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
cat > "$workspace"/agent.cordis.yml <<'EOF'
# Fixed: required config field `provider` added.
- id: tool-subagent
  name: '@deepseek-ai/dsh-tool-subagent'
  config:
    provider: spawn
    toolName: subagent
    backgroundMode: continuable
EOF
