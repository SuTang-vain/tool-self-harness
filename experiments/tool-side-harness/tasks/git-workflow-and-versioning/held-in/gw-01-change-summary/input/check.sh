#!/usr/bin/env bash
set -uo pipefail
if [ ! -f SUMMARY.md ]; then echo "SUMMARY.md not found"; exit 1; fi
n=$(grep -c '^[A-Z][A-Z -]*:' SUMMARY.md || true)
if [ "$n" -lt 3 ]; then echo "SUMMARY.md must contain at least 3 section headers"; exit 1; fi
echo "summary format ok"
