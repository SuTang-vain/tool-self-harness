#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.name,'ticket_create');assert.deepEqual(new Set(t.inputSchema.required),new Set(['title','description']));assert.equal(t.inputSchema.additionalProperties,false);let a=await callTool('ticket_create',{title:'A',description:'B',priority:'high'});let b=await callTool('ticket_create',{title:'C',description:'D'});assert.match(a.content[0].text,/high/);assert.match(b.content[0].text,/t\d+/);await assert.rejects(()=>callTool('ticket_create',{title:'',description:'x'}));await assert.rejects(()=>callTool('ticket_create',{title:'x',description:'y',priority:'urgent'}));
JS
echo 'PASS ticket-create'
