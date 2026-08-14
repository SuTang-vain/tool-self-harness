#!/usr/bin/env bash
set -euo pipefail
node "$(cd "$(dirname "$0")/../.." && pwd)/_shared/verify.js" "$1" "${2:-}" "$(dirname "$0")/expected.json"
