#!/usr/bin/env bash
# reference.sh — apply the correct ec-07 fix (both rows join the group).
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/agent.cordis.yml "$workspace"/agent.cordis.yml
cat > "$workspace"/agent.cordis.yml <<'EOF'
# Fixed: pruner and compaction consumer live inside the compaction group.
- id: compaction
  name: cordis:group
  group: true
  isolate:
    compaction: true
    toolResultPruner: true
  config:
    - id: tool-result-pruner
      name: '@deepseek-ai/dsh-compaction-tool-result-pruner'
      config:
        thresholdChars: 8192
    - id: command-compact
      name: '@deepseek-ai/dsh-command-compact'
    - id: compaction-basic
      name: '@deepseek-ai/dsh-compaction-basic'
EOF
