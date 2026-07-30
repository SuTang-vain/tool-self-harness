#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const [t]=await listTools();assert.equal(t.name,'profile_patch');assert.equal(t.inputSchema.additionalProperties,false);assert.equal(t.inputSchema.properties.profile.additionalProperties,false);const out=JSON.parse((await callTool('profile_patch',{profile:{name:'Ada',labels:{team:'ml'}}})).content[0].text);assert.equal(out.name,'Ada');await assert.rejects(()=>callTool('profile_patch',{profile:{name:'Ada',labels:{team:'ml',extra:3}}}));
JS
echo 'PASS nested-object-schema'
