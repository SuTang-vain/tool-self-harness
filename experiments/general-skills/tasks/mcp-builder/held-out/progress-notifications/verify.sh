#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const values=[];await callTool('run_with_progress',{steps:2},{onProgress:x=>values.push(x)});assert.deepEqual(values,[0,0.5,1]);
JS
echo 'PASS progress-notifications'
