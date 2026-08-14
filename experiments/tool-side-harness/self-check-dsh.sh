#!/usr/bin/env bash
# self-check.sh — grader discrimination audit for the DSH registration bundle.
# For every task: the grader must FAIL on the untouched broken fixture and
# PASS on the reference-repaired workspace.
set -uo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
fail=0
total=0

for suite in editing-cordis-compositions headless-preset; do
  for split in held-in held-out; do
    for task in "$B"/tasks/$suite/$split/*/; do
      [ -d "$task" ] || continue
      name=$(basename "$task")
      total=$((total + 1))

      # 1. broken fixture must FAIL
      rm -rf "$WORK"; mkdir -p "$WORK"
      cp "$task"/input/* "$WORK"/ 2>/dev/null
      out=$(node "$B"/tasks/$suite/_shared/verify.js "$WORK" "" "$task/expected.json" 2>&1)
      st1=$?
      if [ $st1 -ne 0 ]; then broken="FAIL(ok)"; else broken="PASS(BAD)"; fail=$((fail+1)); fi

      # 2. reference repair must PASS grader
      rm -rf "$WORK"; mkdir -p "$WORK"
      bash "$task/reference.sh" "$WORK" >/dev/null 2>&1
      out2=$(node "$B"/tasks/$suite/_shared/verify.js "$WORK" "" "$task/expected.json" 2>&1)
      st2=$?
      if [ $st2 -eq 0 ]; then fixed="PASS(ok)"; else fixed="FAIL(BAD)"; fail=$((fail+1)); fi

      # 3. contract checker: broken must FAIL, reference repair must PASS
      chk=""
      if [ -f "$task/input/check.sh" ]; then
        rm -rf "$WORK"; mkdir -p "$WORK"
        cp "$task"/input/* "$WORK"/ 2>/dev/null
        out3=$(cd "$WORK" && bash check.sh 2>&1); st3=$?
        if [ $st3 -ne 0 ]; then ck1="broken:FAIL(ok)"; else ck1="broken:PASS(BAD)"; fail=$((fail+1)); fi
        rm -rf "$WORK"; mkdir -p "$WORK"
        bash "$task/reference.sh" "$WORK" >/dev/null 2>&1
        cp "$task"/input/check.sh "$WORK"/ 2>/dev/null; cp "$task"/input/check.js "$WORK"/ 2>/dev/null
        out4=$(cd "$WORK" && bash check.sh 2>&1); st4=$?
        if [ $st4 -eq 0 ]; then ck2="fixed:PASS(ok)"; else ck2="fixed:FAIL(BAD)"; fail=$((fail+1)); fi
        chk="checker[$ck1 $ck2]"
      fi

      printf '%-42s broken:%s  fixed:%s  %s\n' "$suite/$name" "$broken" "$fixed" "$chk"
      [ $st1 -ne 0 ] || echo "    broken-fixture detail: $out"
      [ $st2 -eq 0 ] || echo "    reference-fix detail: $out2"
      [ -z "$chk" ] || { [ "${ck1:-x}" = "broken:FAIL(ok)" ] || echo "    checker-broken detail: $out3"; [ "${ck2:-x}" = "fixed:PASS(ok)" ] || echo "    checker-fixed detail: $out4"; }
    done
  done
done
echo "----"
echo "tasks checked: $total, problems: $fail"
exit $fail
