#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import {retry} from './retry.js';
let calls=0; try { await retry(async()=>{calls++;throw new Error('final')},1) } catch(e) { if(e.message!=='final') throw e }
if(calls!==1) throw new Error('expected one attempt, got '+calls);
let zeroCalls=0; await retry(async()=>{zeroCalls++;return 7},1); if(zeroCalls!==1) process.exit(1);
JS
echo 'PASS js-retry-budget'
