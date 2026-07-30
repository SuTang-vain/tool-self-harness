#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const r=await callTool('slow_operation',{request_id:'r1'});assert.match(r.content[0].text,/completed/);await assert.rejects(()=>callTool('slow_operation',{request_id:'r2',delay_ms:51}),e=>e.code==='TIMEOUT');
JS
echo 'PASS request-timeout'
