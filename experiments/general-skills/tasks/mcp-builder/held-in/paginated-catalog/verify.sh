#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.name,'catalog_search');assert.deepEqual(t.inputSchema.required,['query']);assert.equal(t.inputSchema.additionalProperties,false);let r=await callTool('catalog_search',{query:'WIDGET',offset:2,limit:2});assert.match(r.content[0].text,/i3/);assert.doesNotMatch(r.content[0].text,/i1/);await assert.rejects(()=>callTool('catalog_search',{query:'x',limit:6}));await assert.rejects(()=>callTool('catalog_search',{query:'x',offset:-1}));
JS
echo 'PASS paginated-catalog'
