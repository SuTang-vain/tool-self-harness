#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
await assert.rejects(()=>callTool('lookup_invoice',{}),e=>e.code==='INVALID_ARGUMENT');await assert.rejects(()=>callTool('lookup_invoice',{invoice_id:'x'}),e=>e.code==='NOT_FOUND');await assert.rejects(()=>callTool('x',{}),e=>e.code==='UNKNOWN_TOOL');
JS
echo 'PASS tool-error-code-mapping'
