#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.inputSchema.additionalProperties,false);assert.equal((await callTool('text_transform',{text:' Ab ',mode:'uppercase'})).content[0].text,'AB');assert.equal((await callTool('text_transform',{text:' Ab ',mode:'lowercase',trim:false})).content[0].text,' ab ');await assert.rejects(()=>callTool('text_transform',{text:'x',mode:'reverse'}));
JS
echo 'PASS text-transform'
