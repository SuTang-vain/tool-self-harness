#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict'; import {listTools,callTool} from './server.mjs';
const [tool]=await listTools(); assert.equal(tool.name,'customer_lookup'); assert.equal(tool.inputSchema.type,'object'); assert.equal(tool.inputSchema.additionalProperties,false);
await assert.rejects(()=>callTool('customer_lookup',{})); await assert.rejects(()=>callTool('customer_lookup',{customer_id:'missing'})); await assert.rejects(()=>callTool('other',{}));
JS
echo 'PASS customer-directory'
