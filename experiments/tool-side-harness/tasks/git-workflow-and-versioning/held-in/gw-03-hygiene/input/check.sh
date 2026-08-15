#!/usr/bin/env bash
set -uo pipefail
if git ls-files .env | grep -q .env; then echo ".env is tracked"; exit 1; fi
if git diff --cached --name-only | grep -q .env; then echo ".env is staged"; exit 1; fi
echo "hygiene checks pass"
