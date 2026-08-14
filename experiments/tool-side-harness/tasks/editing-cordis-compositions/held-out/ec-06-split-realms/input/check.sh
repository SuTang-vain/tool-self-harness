#!/usr/bin/env bash
set -uo pipefail
node "$(cd "$(dirname "$0")" && pwd)/check.js" "$(pwd)"
