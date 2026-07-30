#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const [t]=await listTools();assert.equal(t.name,'audit_page');assert.equal(t.inputSchema.additionalProperties,false);const first=JSON.parse((await callTool('audit_page',{limit:2})).content[0].text);assert.equal(first.records.length,2);assert.ok(first.next_cursor);await assert.rejects(()=>callTool('audit_page',{limit:2,cursor:'bad'}));
JS
echo 'PASS cursor-pagination'
