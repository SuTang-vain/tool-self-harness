#!/usr/bin/env bash
set -uo pipefail
if [ ! -f CHANGELOG.md ]; then echo "CHANGELOG.md not found"; exit 1; fi
if ! grep -q '^## \[' CHANGELOG.md; then echo "CHANGELOG.md must start a version section (## [x.y.z])"; exit 1; fi
echo "changelog format ok"
