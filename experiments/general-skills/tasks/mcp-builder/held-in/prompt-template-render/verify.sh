#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
assert.equal((await listPrompts())[0].name,'summarize');const p=await getPrompt('summarize',{topic:'MCP'});assert.match(p.messages[0].content.text,/MCP/);await assert.rejects(()=>getPrompt('summarize',{}));
JS
echo 'PASS prompt-template-render'
