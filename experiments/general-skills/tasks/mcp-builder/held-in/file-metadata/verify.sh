#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.name,'file_metadata');assert.equal(t.inputSchema.additionalProperties,false);let r=await callTool('file_metadata',{path:'config.json'});assert.match(r.content[0].text,/\.json/);assert.doesNotMatch(r.content[0].text,/"ok"/);await assert.rejects(()=>callTool('file_metadata',{path:'../server.mjs'}));await assert.rejects(()=>callTool('file_metadata',{path:'missing'}));
JS
echo 'PASS file-metadata'
