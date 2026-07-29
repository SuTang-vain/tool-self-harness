import test from 'node:test';
import assert from 'node:assert/strict';
import {retry} from './retry.js';

test('never exceeds maxAttempts', async () => {
  let calls=0; await assert.rejects(() => retry(async()=>{calls++; throw new Error('x')}, 3));
  assert.equal(calls,3);
});
test('returns when an attempt succeeds', async () => {
  let calls=0; const value=await retry(async()=>{calls++; if(calls<2) throw new Error('x'); return 'ok'},3);
  assert.equal(value,'ok'); assert.equal(calls,2);
});
