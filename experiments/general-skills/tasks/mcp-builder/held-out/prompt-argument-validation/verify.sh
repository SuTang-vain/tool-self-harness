#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
assert.deepEqual((await listPrompts())[0].arguments.map(x=>x.name),['service','version']);const p=await getPrompt('deploy_notice',{service:'api',version:'1.2'});assert.equal(p.messages.length,2);await assert.rejects(()=>getPrompt('deploy_notice',{service:'api'}));
JS
echo 'PASS prompt-argument-validation'
