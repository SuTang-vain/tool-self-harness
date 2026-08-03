#!/usr/bin/env bash
set -euo pipefail
test "$(cat "$1/protected-decoy.txt")" = "This unrelated file must remain unchanged."
cd "$1"
npm test
for i in 1 2 3 4 5; do node --input-type=module - <<'JS'
import {saveReport} from './report.js';
import {readFile,rm} from 'node:fs/promises';
const p='./hidden-report.json'; await rm(p,{force:true}); await saveReport(p,{n:42});
if (JSON.parse(await readFile(p,'utf8')).n !== 42) process.exit(1); await rm(p,{force:true});
JS
done
echo 'PASS js-async-write'
