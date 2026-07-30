'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { observedTestExit } = require('../experiments/tool-side-harness/tasks/using-git-worktrees-expanded-v2/_shared/verify-test-exit');

test('uses direct tool exit when no explicit inner status exists', () => {
  assert.equal(observedTestExit({ result: { exit_code: 0, stdout: 'ok' } }), 0);
});

test('recognizes dashed shell wrapper exit marker', () => {
  assert.equal(observedTestExit({ result: { exit_code: 0, stdout: '---exit:1---' } }), 1);
});

test('recognizes hyphenated test exit code marker', () => {
  assert.equal(observedTestExit({ result: { exit_code: 0, stdout: '===TEST-EXIT-CODE: 1===' } }), 1);
});

test('recognizes underscore marker', () => {
  assert.equal(observedTestExit({ result: { exit_code: 0, stderr: 'EXIT_CODE=2' } }), 2);
});
