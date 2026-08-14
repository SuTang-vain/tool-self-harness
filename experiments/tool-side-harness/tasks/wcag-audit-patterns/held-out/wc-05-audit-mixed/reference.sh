#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/page.html "$workspace"/page.html
cat > "$workspace"/audit.md <<'YEOF'
# Accessibility Audit

## Critical

- img-missing-alt: the image has no alt text

## Serious

## Moderate

- missing-lang: the html element has no lang attribute
- missing-h1: the page has no h1 heading
YEOF
