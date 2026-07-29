#!/usr/bin/env bash
set -euo pipefail
cd "$1";npm test
node --input-type=module - <<'JS'
import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';const [t]=await listTools();assert.equal(t.name,'sales_report');assert.equal(t.inputSchema.additionalProperties,false);let r=await callTool('sales_report',{start_date:'2026-02-01',end_date:'2026-02-01'});assert.match(r.content[0].text,/30/);await assert.rejects(()=>callTool('sales_report',{start_date:'bad',end_date:'2026-01-01'}));await assert.rejects(()=>callTool('sales_report',{start_date:'2026-02-01',end_date:'2026-01-01'}));
JS
echo 'PASS date-range-report'
