#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const first=JSON.parse((await callTool('page',{limit:2})).content[0].text);assert.ok(first.next_cursor);await assert.rejects(()=>callTool('page',{limit:2,cursor:'stale'}),e=>e.code==='INVALID_CURSOR');
JS
echo 'PASS invalid-cursor-recovery'
