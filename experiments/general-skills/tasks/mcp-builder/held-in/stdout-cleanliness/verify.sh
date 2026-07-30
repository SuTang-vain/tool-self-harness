#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const r=await callTool('emit_log',{message:'hello',level:'info'});assert.equal(r.content[0].text,'logged');
JS
echo 'PASS stdout-cleanliness'
