#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.inputSchema.additionalProperties,false,'FAIL_CODE=STRICT_SCHEMA_ADDITIONAL_PROPERTIES events_list');let first=await callTool('events_list',{page_size:1});let m=first.content[0].text.match(/next_cursor[:=]\s*([A-Za-z0-9_-]+)/);assert.ok(m);let second=await callTool('events_list',{cursor:m[1],page_size:2});assert.match(second.content[0].text,/e2/);assert.doesNotMatch(second.content[0].text,/e1/);await assert.rejects(()=>callTool('events_list',{cursor:'bad'}));
JS
echo 'PASS event-page'
