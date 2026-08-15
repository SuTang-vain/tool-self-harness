#!/usr/bin/env bash
set -uo pipefail
if [ ! -f CHANGELOG.md ]; then echo "CHANGELOG.md not found"; exit 1; fi
if ! grep -q '^## \[' CHANGELOG.md; then echo "CHANGELOG.md must start a version section"; exit 1; fi
if ! grep -q '^### ' CHANGELOG.md; then echo "CHANGELOG.md must group entries under ### headings"; exit 1; fi
echo "changelog format ok"
