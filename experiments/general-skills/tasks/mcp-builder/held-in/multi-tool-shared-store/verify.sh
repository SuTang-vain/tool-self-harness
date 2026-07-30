#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const a=JSON.parse((await callTool('item_create',{name:'a',tag:'x'})).content[0].text);await callTool('item_update',{item_id:a.item_id,tag:'y'});const b=JSON.parse((await callTool('item_get',{item_id:a.item_id})).content[0].text);assert.equal(b.name,'a');assert.equal(b.tag,'y');
JS
echo 'PASS multi-tool-shared-store'
