#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/src.txt "$workspace"/src.txt
bash "$here"/setup.sh "$workspace"
cat > "$workspace"/CHANGELOG.md <<'YEOF'
## [1.5.0] - 2026-08-14
### Deprecated
- `GET /v1/tasks/all` — use the paginated `GET /v1/tasks` (removal in 2.0)

## [1.4.0] - 2026-08-01
### Added
- Task creation
YEOF
