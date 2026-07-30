'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { observedTestExit, isBaselineTestCommand } = require('../experiments/tool-side-harness/tasks/using-git-worktrees-expanded-v3/_shared/verify-test-exit');

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

test('recognizes npm test forms used by task traces', () => {
  assert.equal(isBaselineTestCommand('cd .worktrees/x && npm test 2>&1'), true);
  assert.equal(isBaselineTestCommand('cd .worktrees/x && npm run test'), true);
  assert.equal(isBaselineTestCommand('WT=".worktrees/x" && npm --prefix "$WT" test 2>&1; echo "EXIT=$?"'), true);
  assert.equal(isBaselineTestCommand('npm --prefix=.worktrees/x test'), true);
});

test('recognizes equivalent direct node test command', () => {
  assert.equal(isBaselineTestCommand('cd .worktrees/x && node test.js'), true);
});

test('does not classify inspection commands as tests', () => {
  assert.equal(isBaselineTestCommand('cat package.json && cat test.js'), false);
  assert.equal(isBaselineTestCommand('npm --version && node --version'), false);
});
