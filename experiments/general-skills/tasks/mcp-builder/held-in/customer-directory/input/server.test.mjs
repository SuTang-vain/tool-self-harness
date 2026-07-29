import test from 'node:test'; import assert from 'node:assert/strict'; import {listTools,callTool} from './server.mjs';
test('lists customer_lookup',async()=>{const t=await listTools();assert.equal(t[0].name,'customer_lookup');assert.deepEqual(t[0].inputSchema.required,['customer_id'])});
test('looks up customer',async()=>{const r=await callTool('customer_lookup',{customer_id:'c1'});assert.match(r.content[0].text,/Ada/)});
