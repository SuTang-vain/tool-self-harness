#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const a=JSON.parse((await callTool('charge',{request_id:'r1',cents:100})).content[0].text);const b=JSON.parse((await callTool('charge',{request_id:'r1',cents:100})).content[0].text);assert.deepEqual(a,b);const c=JSON.parse((await callTool('charge',{request_id:'r2',cents:100})).content[0].text);assert.equal(c.charge_id,'ch2');
JS
echo 'PASS idempotent-retry'
