import test from 'node:test';import assert from 'node:assert/strict';import {listTools,callTool} from './server.mjs';
test('profile patch',async()=>{const [t]=await listTools();assert.equal(t.name,'profile_patch');assert.equal(t.inputSchema.additionalProperties,false);assert.equal((await callTool('profile_patch',{profile:{name:'Ada',labels:{team:'ml'}}})).content[0].text.includes('Ada'),true)});
