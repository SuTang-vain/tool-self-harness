#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
await callTool('open_client',{client_id:'a'});await callTool('open_client',{client_id:'b'});await callTool('client_put',{client_id:'a',key:'k',value:'v'});assert.equal((await callTool('client_get',{client_id:'a',key:'k'})).content[0].text,'v');await assert.rejects(()=>callTool('client_get',{client_id:'b',key:'k'}));
JS
echo 'PASS multi-client-isolation'
