#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/page.html "$workspace"/page.html
cat > "$workspace"/audit.md <<'YEOF'
# Accessibility Audit

## Critical

## Serious

- missing-title: the page has no title element
- div-onclick: a clickable div has no keyboard-accessible role

## Moderate
YEOF
