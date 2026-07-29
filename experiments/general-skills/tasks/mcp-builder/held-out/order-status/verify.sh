#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.inputSchema.additionalProperties,false);let r=await callTool('order_status',{order_id:'o1',include_history:true});assert.match(r.content[0].text,/created/);assert.match(r.content[0].text,/paid/);await assert.rejects(()=>callTool('order_status',{order_id:'missing'}));await assert.rejects(()=>callTool('order_status',{order_id:'o1',include_history:'yes'}));
JS
echo 'PASS order-status'
