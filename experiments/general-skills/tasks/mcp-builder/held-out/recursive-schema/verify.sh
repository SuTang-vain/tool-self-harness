#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
assert.equal((await callTool('tree_sum',{tree:{value:2,children:[{value:3},{value:4}]}})).content[0].text,'9');await assert.rejects(()=>callTool('tree_sum',{tree:{value:1,extra:2}}));
JS
echo 'PASS recursive-schema'
