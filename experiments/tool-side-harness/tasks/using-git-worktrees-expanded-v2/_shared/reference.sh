#!/usr/bin/env bash
set -u
workspace="$1"
trace="$2"
expected="$3"
read_json() {
  node -e 'const x=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); const v=x[process.argv[2]]; console.log(v == null ? "" : v)' "$expected" "$1"
}
mode=$(read_json mode)
branch=$(read_json branch)
test_exit=$(read_json test_exit)
if [[ "$mode" == "created" ]]; then
  location=$(read_json location)
  ignored=$(read_json ignored_dir)
  branch_preexists=$(read_json branch_preexists)
  if [[ -n "$ignored" ]] && ! git -C "$workspace" check-ignore -q --no-index "${ignored%/}/"; then
    printf '\n%s/\n' "${ignored%/}" >> "$workspace/.gitignore"
    git -C "$workspace" add .gitignore
    git -C "$workspace" -c user.name='Reference Repair' -c user.email=reference@example.invalid commit -q -m 'Ignore local worktrees'
  fi
  if [[ "$branch_preexists" == "true" ]]; then
    git -C "$workspace" worktree add -q "$workspace/$location" "$branch"
  else
    git -C "$workspace" worktree add -q "$workspace/$location" -b "$branch"
  fi
  set +e
  (cd "$workspace/$location" && npm test >/tmp/tool-side-worktree-reference-test.log 2>&1)
  actual=$?
  set -e
  command="cd $location && npm test"
elif [[ "$mode" == "reuse-existing" ]]; then
  location=$(read_json location)
  set +e
  (cd "$workspace/$location" && npm test >/tmp/tool-side-worktree-reference-test.log 2>&1)
  actual=$?
  set -e
  command="cd $location && npm test"
else
  set +e
  (cd "$workspace" && npm test >/tmp/tool-side-worktree-reference-test.log 2>&1)
  actual=$?
  set -e
  command="npm test"
fi
if [[ "$actual" != "$test_exit" ]]; then
  echo "reference test exit $actual != expected $test_exit" >&2
  exit 1
fi
if [[ "$test_exit" == "0" ]]; then final='Worktree ready; tests passing.'; else final='Baseline tests are failing, so the workspace is blocked and not ready.'; fi
mkdir -p "$(dirname "$trace")"
node - "$trace" "$command" "$actual" "$final" <<'NODE'
const fs=require('fs');
const [trace,command,exitCode,final]=process.argv.slice(2);
const rows=[
  {type:'tool_call',name:'run_command',args:{command},result:{exit_code:Number(exitCode)}},
  {type:'final_answer',content:final},
  {type:'task_end',final_answer:final,error:null}
];
fs.writeFileSync(trace,rows.map(x=>JSON.stringify(x)).join('\n')+'\n');
NODE
