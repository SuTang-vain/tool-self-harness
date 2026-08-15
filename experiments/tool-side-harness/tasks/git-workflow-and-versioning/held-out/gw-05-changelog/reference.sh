#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
bash "$here"/setup.sh "$workspace"
cat > "$workspace"/CHANGELOG.md <<'YEOF'
## [1.4.1] - 2026-08-14
### Fixed
- Timezone drift in recurring task due dates
YEOF
