#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
assert.deepEqual(await subscribeResource('res://a'),{subscribed:true,uri:'res://a'});assert.deepEqual(await unsubscribeResource('res://a'),{unsubscribed:true,uri:'res://a'});await assert.rejects(()=>unsubscribeResource('res://a'));
JS
echo 'PASS resource-subscription'
