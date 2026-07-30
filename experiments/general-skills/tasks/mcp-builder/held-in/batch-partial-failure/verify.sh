#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const r=JSON.parse((await callTool('batch_lookup',{ids:['a','x','b']})).content[0].text);assert.deepEqual(r.results.map(x=>x.ok),[true,false,true]);
JS
echo 'PASS batch-partial-failure'
