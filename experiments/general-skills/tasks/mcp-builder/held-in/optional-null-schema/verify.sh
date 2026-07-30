#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const [t]=await listTools();assert.equal(t.name,'user_note');assert.ok(t.inputSchema.properties.note.anyOf);assert.equal(JSON.parse((await callTool('user_note',{user_id:'u1',note:null})).content[0].text).note,null);await assert.rejects(()=>callTool('user_note',{user_id:'u1',note:4}));
JS
echo 'PASS optional-null-schema'
