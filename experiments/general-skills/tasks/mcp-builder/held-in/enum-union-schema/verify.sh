#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const [t]=await listTools();assert.equal(t.name,'format_value');assert.deepEqual(t.inputSchema.properties.kind.enum,['text','integer']);assert.equal((await callTool('format_value',{value:'abc',kind:'text'})).content[0].text,'ABC');await assert.rejects(()=>callTool('format_value',{value:'x',kind:'float'}));
JS
echo 'PASS enum-union-schema'
