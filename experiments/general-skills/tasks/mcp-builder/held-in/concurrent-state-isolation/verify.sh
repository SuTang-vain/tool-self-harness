#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
await callTool('begin_session',{session_id:'s1'});await callTool('begin_session',{session_id:'s2'});await callTool('put_value',{session_id:'s1',key:'k',value:'one'});assert.equal((await callTool('get_value',{session_id:'s1',key:'k'})).content[0].text,'one');await assert.rejects(()=>callTool('get_value',{session_id:'s2',key:'k'}));
JS
echo 'PASS concurrent-state-isolation'
