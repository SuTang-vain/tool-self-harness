#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.name,'inventory_search');assert.deepEqual(t.inputSchema.required,['query']);assert.equal(t.inputSchema.additionalProperties,false,'FAIL_CODE=STRICT_SCHEMA_ADDITIONAL_PROPERTIES inventory_search');let r=await callTool('inventory_search',{query:'PEN',limit:1});assert.equal((r.content[0].text.match(/p[12]/g)||[]).length,1);await assert.rejects(()=>callTool('inventory_search',{query:'',limit:1}));await assert.rejects(()=>callTool('inventory_search',{query:'pen',limit:11}));
JS
echo 'PASS inventory-search'
