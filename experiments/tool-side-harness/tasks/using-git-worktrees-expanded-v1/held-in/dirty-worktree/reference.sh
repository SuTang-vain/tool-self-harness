#!/usr/bin/env bash
set -euo pipefail
"$(cd "$(dirname "$0")/../.." && pwd)/_shared/reference.sh" "$1" "$2" "$(dirname "$0")/expected.json"
