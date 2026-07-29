#!/usr/bin/env bash
# verify.sh - judge whether the model produced a correct Data Pack for t01
#
# Args: $1 = path to the model's produced data.json
# Exit 0 = pass, non-zero = fail (stderr explains why)
#
# Judgement:
#   1. validate must pass (0 errors)
#   2. semantic fields (entities, aliases, relationTypes, relations, provenance)
#      must deep-equal the expected pack (meta/assets/schemaVersion ignored -
#      they are environment-dependent)
set -uo pipefail

PRODUCED="${1:-}"
EXPECTED="$(cd "$(dirname "$0")" && pwd)/expected/data.json"
SKILL="${SG_DATA_PACK_SKILL:-$HOME/DEV/sg-data-pack/scripts/sg-data-pack}"
HERE="$(cd "$(dirname "$0")" && pwd)"

if [[ -z "$PRODUCED" || ! -f "$PRODUCED" ]]; then
  echo "FAIL: no produced data.json (arg1 empty or missing)" >&2
  exit 2
fi

# 1. structural validation
if ! node "$SKILL" validate "$PRODUCED" >/tmp/t01-validate.out 2>&1; then
  echo "FAIL: validate failed" >&2
  cat /tmp/t01-validate.out >&2
  exit 1
fi

# 2. semantic deep-equal (normalize key order with jq -S, compare data fields only)
cmp_fields() {
  local f="$1"
  jq -S ".${f} // null" "$2" > "/tmp/t01-prod-${f}" 2>/dev/null || echo "null" > "/tmp/t01-prod-${f}"
  jq -S ".${f} // null" "$3" > "/tmp/t01-exp-${f}" 2>/dev/null || echo "null" > "/tmp/t01-exp-${f}"
  if ! diff -q "/tmp/t01-prod-${f}" "/tmp/t01-exp-${f}" >/dev/null; then
    echo "FAIL: field '${f}' mismatch" >&2
    diff "/tmp/t01-prod-${f}" "/tmp/t01-exp-${f}" >&2
    return 1
  fi
  return 0
}

status=0

# entities: exact match (structurally important)
cmp_fields entities "$PRODUCED" "$EXPECTED" || status=1

# aliases: exact match (structurally important)
cmp_fields aliases "$PRODUCED" "$EXPECTED" || status=1

# relationTypes: compare only the label (color is cosmetic/optional)
jq -S '.relationTypes | to_entries | map({key:.key,label:(.value.label|ascii_downcase)})' "$PRODUCED" > /tmp/t01-prod-rt 2>/dev/null
jq -S '.relationTypes | to_entries | map({key:.key,label:(.value.label|ascii_downcase)})' "$EXPECTED" > /tmp/t01-exp-rt 2>/dev/null
if ! diff -q /tmp/t01-prod-rt /tmp/t01-exp-rt >/dev/null; then
  echo "FAIL: relationTypes labels mismatch" >&2
  diff /tmp/t01-prod-rt /tmp/t01-exp-rt >&2
  status=1
fi

# relations: compare {a,b,type} only (label is optional - model may add it to avoid W3)
jq -S '.relations | map({a:.a,b:.b,type:.type})' "$PRODUCED" > /tmp/t01-prod-rel 2>/dev/null
jq -S '.relations | map({a:.a,b:.b,type:.type})' "$EXPECTED" > /tmp/t01-exp-rel 2>/dev/null
if ! diff -q /tmp/t01-prod-rel /tmp/t01-exp-rel >/dev/null; then
  echo "FAIL: relations mismatch" >&2
  diff /tmp/t01-prod-rel /tmp/t01-exp-rel >&2
  status=1
fi

# provenance: check key coverage + confidence only (origin/note/sourceUrl are free-form)
jq -S '.provenance.entities | keys' "$PRODUCED" > /tmp/t01-prod-pke 2>/dev/null
jq -S '.provenance.entities | keys' "$EXPECTED" > /tmp/t01-exp-pke 2>/dev/null
jq -S '.provenance.relations | keys' "$PRODUCED" > /tmp/t01-prod-pkr 2>/dev/null
jq -S '.provenance.relations | keys' "$EXPECTED" > /tmp/t01-exp-pkr 2>/dev/null
if ! diff -q /tmp/t01-prod-pke /tmp/t01-exp-pke >/dev/null; then
  echo "FAIL: provenance entity keys mismatch" >&2; diff /tmp/t01-prod-pke /tmp/t01-exp-pke >&2; status=1
fi
if ! diff -q /tmp/t01-prod-pkr /tmp/t01-exp-pkr >/dev/null; then
  echo "FAIL: provenance relation keys mismatch" >&2; diff /tmp/t01-prod-pkr /tmp/t01-exp-pkr >&2; status=1
fi
# confidence must be 1.0 (baseline data)
PROD_CONF=$(jq -c '[.provenance.entities[].confidence] | unique' "$PRODUCED" 2>/dev/null)
if [[ "$PROD_CONF" != "[1]" ]]; then
  echo "FAIL: provenance confidence not 1.0 (got $PROD_CONF)" >&2; status=1
fi

if [[ $status -eq 0 ]]; then
  echo "PASS: t01-id-based"
  exit 0
fi
exit 1
