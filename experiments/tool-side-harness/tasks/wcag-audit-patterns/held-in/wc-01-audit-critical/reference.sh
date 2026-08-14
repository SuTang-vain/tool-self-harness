#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/page.html "$workspace"/page.html
cat > "$workspace"/audit.md <<'YEOF'
# Accessibility Audit

## Critical

- img-missing-alt: the logo image has no alt text
- input-missing-label: the email input has no associated label

## Serious

## Moderate
YEOF
