#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.name,'users_get_many');assert.equal(t.inputSchema.additionalProperties,false);let r=await callTool('users_get_many',{user_ids:['u3','u1']});assert.ok(r.content[0].text.indexOf('Edsger')<r.content[0].text.indexOf('Ada'));await assert.rejects(()=>callTool('users_get_many',{user_ids:[]}));await assert.rejects(()=>callTool('users_get_many',{user_ids:['u1','u1']}));await assert.rejects(()=>callTool('users_get_many',{user_ids:['1','2','3','4','5','6']}));
JS
echo 'PASS batch-user-lookup'
