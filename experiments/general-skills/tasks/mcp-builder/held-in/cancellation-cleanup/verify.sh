#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
await callTool('start_job',{job_id:'j1'});const r=await callTool('cancel_job',{job_id:'j1'});assert.match(r.content[0].text,/cancelled/);await assert.rejects(()=>callTool('cancel_job',{job_id:'j1'}));
JS
echo 'PASS cancellation-cleanup'
