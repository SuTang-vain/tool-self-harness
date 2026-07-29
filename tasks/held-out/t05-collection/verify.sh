#!/usr/bin/env bash
# verify.sh - judge t05 (collection-page library)
set -uo pipefail
PRODUCED="${1:-}"
EXPECTED="$(cd "$(dirname "$0")" && pwd)/expected/data.json"
SKILL="${SG_DATA_PACK_SKILL:-$HOME/DEV/sg-data-pack/scripts/sg-data-pack}"
if [[ -z "$PRODUCED" || ! -f "$PRODUCED" ]]; then echo "FAIL: no produced data.json" >&2; exit 2; fi
if ! node "$SKILL" validate "$PRODUCED" >/tmp/t05-v.out 2>&1; then
  echo "FAIL: validate failed" >&2; cat /tmp/t05-v.out >&2; exit 1
fi
status=0
cmp() { jq -S "$2" "$3" > "/tmp/t05-prod-$1" 2>/dev/null; jq -S "$2" "$4" > "/tmp/t05-exp-$1" 2>/dev/null
  diff -q "/tmp/t05-prod-$1" "/tmp/t05-exp-$1" >/dev/null || { echo "FAIL: $1 mismatch" >&2; diff "/tmp/t05-prod-$1" "/tmp/t05-exp-$1" >&2; status=1; } }
cmp entities '.entities' "$PRODUCED" "$EXPECTED"
cmp aliases '.aliases' "$PRODUCED" "$EXPECTED"
cmp reltypes '.relationTypes | to_entries | map({key:.key,label:(.value.label|ascii_downcase)})' "$PRODUCED" "$EXPECTED"
cmp rels '.relations | map({a:.a,b:.b,type:.type,label:(.label|ascii_downcase)}) | sort_by(.a)' "$PRODUCED" "$EXPECTED"
cmp pke '.provenance.entities | keys' "$PRODUCED" "$EXPECTED"
cmp pkr '.provenance.relations | keys' "$PRODUCED" "$EXPECTED"
CONF=$(jq -c '[.provenance.entities[].confidence] | unique' "$PRODUCED" 2>/dev/null)
[[ "$CONF" == "[1]" || "$CONF" == "[1.0]" ]] || { echo "FAIL: confidence not 1.0 (got $CONF)" >&2; status=1; }
[[ $status -eq 0 ]] && { echo "PASS: t05-collection"; exit 0; } ; exit 1
