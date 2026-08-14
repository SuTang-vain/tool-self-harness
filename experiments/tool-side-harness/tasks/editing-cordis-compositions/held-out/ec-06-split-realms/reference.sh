#!/usr/bin/env bash
# reference.sh — apply the correct ec-06 fix (merge the split realms).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
cat > "$workspace"/agent.cordis.yml <<'EOF'
# Fixed: one delegation group carries the provider AND the consumer.
- id: delegation
  name: cordis:group
  group: true
  isolate:
    workflows: true
  config:
    - id: workflow-worker-thread
      name: '@deepseek-ai/dsh-workflow-worker-thread'
      config:
        provider: spawn
    - id: tool-workflow
      name: '@deepseek-ai/dsh-tool-workflow'
EOF
