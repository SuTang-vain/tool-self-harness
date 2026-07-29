#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const tools=await listTools();assert.deepEqual(tools.map(t=>t.name).sort(),['note_create','note_get']);for(const t of tools)assert.equal(t.inputSchema.additionalProperties,false,'FAIL_CODE=STRICT_SCHEMA_ADDITIONAL_PROPERTIES '+t.name);
await assert.rejects(()=>callTool('note_create',{title:'',body:'x'}));await assert.rejects(()=>callTool('note_get',{note_id:'missing'}));await assert.rejects(()=>callTool('x',{}));
JS
echo 'PASS notes-store'
