#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/page.html "$workspace"/page.html
cat > "$workspace"/audit.md <<'YEOF'
# Accessibility Audit

## Critical

## Serious

- Missing page title: the page has no title element
- Non-keyboard-operable interactive element: a clickable div lacks keyboard access

## Moderate
YEOF
