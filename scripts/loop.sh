#!/usr/bin/env bash
# loop.sh - orchestrate the Self-Harness improvement loop
#
# Usage: bash scripts/loop.sh [config.yaml] [rounds]
#
# Runs N rounds of: 01-run-round -> 02-mine-weakness -> 03-propose ->
# 04-validate -> 05-accept. Each round evolves the sandbox SKILL.md.
set -euo pipefail

CONFIG="${1:-config.yaml}"
ROUNDS="${2:-3}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"

echo "============================================================"
echo "  Tool Self-Harness - starting $ROUNDS round(s)"
echo "  config: $CONFIG"
echo "  cwd:     $HERE"
echo "============================================================"

for ((r=0; r<ROUNDS; r++)); do
  ROUND="round-$r"
  echo ""
  echo "============================================================"
  echo "  ROUND $r  ($ROUND)"
  echo "============================================================"

  # 1. Run current harness on held-in split (collects traces)
  echo "--- [1/5] 01-run-round (held-in) ---"
  node scripts/01-run-round.js "$CONFIG" "$ROUND" held-in

  # 2. Mine weaknesses from failed traces
  echo "--- [2/5] 02-mine-weakness ---"
  node scripts/02-mine-weakness.js "$CONFIG" "$ROUND"

  # If everything passed, no proposals to make
  PASS=$(node -e "const e=JSON.parse(require('fs').readFileSync('evidence/$ROUND.json','utf8'));process.stdout.write(String(e.passed))")
  TOTAL=$(node -e "const e=JSON.parse(require('fs').readFileSync('evidence/$ROUND.json','utf8'));process.stdout.write(String(e.total_tasks))")
  echo "  held-in: $PASS/$TOTAL passed"
  if [[ "$PASS" == "$TOTAL" ]]; then
    echo "  All held-in tasks passed - no weaknesses to mine. Skipping proposal."
    continue
  fi

  # 3. Propose K bounded edits
  echo "--- [3/5] 03-propose ---"
  node scripts/03-propose.js "$CONFIG" "$ROUND"

  # 4. Validate each candidate via regression on both splits
  echo "--- [4/5] 04-validate ---"
  node scripts/04-validate.js "$CONFIG" "$ROUND"

  # 5. Accept/reject + merge into lineage
  echo "--- [5/5] 05-accept ---"
  node scripts/05-accept.js "$CONFIG" "$ROUND"

done

echo ""
echo "============================================================"
echo "  Loop complete. Lineage:"
echo "============================================================"
ls -1 lineage/ 2>/dev/null || echo "  (no lineage dir)"
echo ""
echo "Final harness diff vs h0:"
git -C sandbox diff h0 -- SKILL.md 2>/dev/null | head -50 || echo "  (sandbox not a git repo yet)"
