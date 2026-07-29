#!/usr/bin/env bash
# verify.sh - judge t03 (multi-stage with scope disambiguation)
set -uo pipefail
PRODUCED="${1:-}"
EXPECTED="$(cd "$(dirname "$0")" && pwd)/expected/data.json"
SKILL="${SG_DATA_PACK_SKILL:-$HOME/DEV/sg-data-pack/scripts/sg-data-pack}"
if [[ -z "$PRODUCED" || ! -f "$PRODUCED" ]]; then echo "FAIL: no produced data.json" >&2; exit 2; fi
if ! node "$SKILL" validate "$PRODUCED" >/tmp/t03-v.out 2>&1; then
  echo "FAIL: validate failed" >&2; cat /tmp/t03-v.out >&2; exit 1
fi
status=0
cmp() { jq -S "$2" "$3" > "/tmp/t03-prod-$1" 2>/dev/null; jq -S "$2" "$4" > "/tmp/t03-exp-$1" 2>/dev/null
  diff -q "/tmp/t03-prod-$1" "/tmp/t03-exp-$1" >/dev/null || { echo "FAIL: $1 mismatch" >&2; diff "/tmp/t03-prod-$1" "/tmp/t03-exp-$1" >&2; status=1; } }
cmp entities '.entities' "$PRODUCED" "$EXPECTED"
cmp aliases '.aliases' "$PRODUCED" "$EXPECTED"
cmp reltypes '.relationTypes | to_entries | map({key:.key,label:(.value.label|ascii_downcase)})' "$PRODUCED" "$EXPECTED"
# relations: compare {a,b,type,scope} (scope as sorted array; label optional)
cmp rels '.relations | map({a:.a,b:.b,type:.type,scope:(.scope|sort)}) | sort_by(.a,.b,.type)' "$PRODUCED" "$EXPECTED"
cmp stagekeys '.stages | map(.key)' "$PRODUCED" "$EXPECTED"
cmp pke '.provenance.entities | keys' "$PRODUCED" "$EXPECTED"
cmp pkr '.provenance.relations | keys' "$PRODUCED" "$EXPECTED"
CONF=$(jq -c '[.provenance.entities[].confidence] | unique' "$PRODUCED" 2>/dev/null)
[[ "$CONF" == "[1]" || "$CONF" == "[1.0]" ]] || { echo "FAIL: confidence not 1.0 (got $CONF)" >&2; status=1; }
[[ $status -eq 0 ]] && { echo "PASS: t03-multi-stage"; exit 0; } ; exit 1
