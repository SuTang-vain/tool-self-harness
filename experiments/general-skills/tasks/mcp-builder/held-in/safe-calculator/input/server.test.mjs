import test from 'node:test';import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';
test('schema',async()=>{const [t]=await listTools();assert.equal(t.name,'calculate');assert.deepEqual(new Set(t.inputSchema.required),new Set(['a','b','operation']))});
test('adds',async()=>{const r=await callTool('calculate',{a:2,b:3,operation:'add'});assert.match(r.content[0].text,/5/)});
