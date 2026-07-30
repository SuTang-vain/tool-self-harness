#!/usr/bin/env bash
set -euo pipefail
cd "$1"
npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import * as server from './server.mjs';
const {listTools,callTool,listResources,readResource,listPrompts,getPrompt,getCapabilities,subscribeResource,unsubscribeResource}=server;
const r=await callTool('download_asset',{asset_id:'a1'});assert.equal(r.content[0].type,'resource');assert.equal(r.content[0].resource.mimeType,'image/png');assert.match(r.content[0].resource.blob,/^iVBOR/);await assert.rejects(()=>callTool('download_asset',{asset_id:'a9'}));
JS
echo 'PASS binary-content-metadata'
