import test from 'node:test';import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';
test('create then get',async()=>{const c=await callTool('note_create',{title:'A',body:'B'});const id=c.content[0].text.match(/n\d+/)[0];const g=await callTool('note_get',{note_id:id});assert.match(g.content[0].text,/A/)});
test('lists two tools',async()=>assert.equal((await listTools()).length,2));
