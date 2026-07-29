#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.inputSchema.additionalProperties,false);
for(const [op,v] of [['subtract',-1],['multiply',6],['divide',2/3]]){const r=await callTool('calculate',{a:2,b:3,operation:op});assert.equal(Number(r.content[0].text),v)}
await assert.rejects(()=>callTool('calculate',{a:1,b:0,operation:'divide'}));await assert.rejects(()=>callTool('calculate',{a:1,b:2,operation:'pow'}));await assert.rejects(()=>callTool('calculate',{a:1,b:2,operation:'add',extra:1}));
JS
echo 'PASS safe-calculator'
