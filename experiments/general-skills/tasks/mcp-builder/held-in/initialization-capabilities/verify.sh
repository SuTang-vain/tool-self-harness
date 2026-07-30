#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
assert.deepEqual(await getCapabilities(),{tools:{listChanged:false},resources:{subscribe:false}});assert.equal((await listTools())[0].name,'health_check');assert.equal((await callTool('health_check',{})).content[0].text,'ok');
JS
echo 'PASS initialization-capabilities'
