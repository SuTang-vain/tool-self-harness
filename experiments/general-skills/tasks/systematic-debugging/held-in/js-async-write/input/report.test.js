import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import { saveReport } from './report.js';

test('awaiting saveReport means the report is durable', async () => {
  const path = './tmp-report.json';
  await rm(path, {force:true});
  await saveReport(path, {ok:true});
  assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), {ok:true});
  await rm(path, {force:true});
});
