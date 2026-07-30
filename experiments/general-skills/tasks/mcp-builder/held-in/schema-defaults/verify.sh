#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const [t]=await listTools();assert.equal(t.inputSchema.properties.limit.default,2);const r=JSON.parse((await callTool('search_records',{query:'a'})).content[0].text);assert.ok(r.records.length<=2);
JS
echo 'PASS schema-defaults'
