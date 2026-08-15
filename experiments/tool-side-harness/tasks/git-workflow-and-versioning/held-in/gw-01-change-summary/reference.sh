#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
bash "$here"/setup.sh "$workspace"
cat > "$workspace"/SUMMARY.md <<'YEOF'
CHANGES MADE:
- src.txt: Added validation middleware

THINGS I DIDN'T TOUCH (intentionally):
- Nothing else changed

POTENTIAL CONCERNS:
- None
YEOF
