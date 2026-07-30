#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const r=await listResources();assert.equal(r.resourceTemplates[0].uriTemplate,'users/{user_id}/profile');const x=await readResource('users/u1/profile');assert.equal(x.contents[0].text,'Ada Lovelace');await assert.rejects(()=>readResource('users/u9/profile'));
JS
echo 'PASS resource-template-read'
