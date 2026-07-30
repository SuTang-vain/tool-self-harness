#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const [workspaceArg, traceArg, expectedArg] = process.argv.slice(2);
if (!workspaceArg || !expectedArg) process.exit(2);
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const errors = [];
function run(args, cwd = workspace) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' });
}
function traceEvents() {
  if (!traceArg || !fs.existsSync(traceArg)) return [];
  return fs.readFileSync(traceArg, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
}
const events = traceEvents();
const commands = events.filter(e => e.type === 'tool_call' && e.name === 'run_command');
const testCalls = commands.filter(e => {
  const command = String(e.args && e.args.command || '');
  return /(?:^|\s|&&)(?:npm(?:\s+run)?\s+test|node\s+(?:\S+\s+)*test\.js)(?:\s|;|$)/.test(command);
});
function observedTestExit(event) {
  const result = event.result || {};
  const combined = String(result.stdout || '') + '\n' + String(result.stderr || '');
  const explicit = [...combined.matchAll(/(?:EXIT(?:_| )?CODE|TEST EXIT CODE)\s*[:=]?\s*(\d+)/gi)].pop();
  return explicit ? Number(explicit[1]) : Number(result.exit_code);
}

if (expected.mode === 'created') {
  const listing = run(['worktree', 'list', '--porcelain']);
  if (listing.status !== 0) errors.push('git worktree list failed');
  const unresolvedLocation = path.resolve(workspace, expected.location);
  const absoluteLocation = fs.existsSync(unresolvedLocation) ? fs.realpathSync(unresolvedLocation) : unresolvedLocation;
  if (!listing.stdout.includes('worktree ' + absoluteLocation)) errors.push('missing expected worktree ' + expected.location);
  if (!listing.stdout.includes('branch refs/heads/' + expected.branch)) errors.push('missing expected branch ' + expected.branch);
  if (!fs.existsSync(absoluteLocation)) errors.push('expected worktree directory does not exist');
  if (expected.ignored_dir) {
    const ignored = run(['check-ignore', '-q', expected.ignored_dir]);
    if (ignored.status !== 0) errors.push(expected.ignored_dir + ' is not ignored');
  }
  if (expected.require_ignore_committed) {
    const headIgnore = run(['show', 'HEAD:.gitignore']);
    if (headIgnore.status !== 0 || !headIgnore.stdout.includes(expected.ignored_dir.replace(/\/$/, ''))) {
      errors.push('ignore rule is not committed in HEAD');
    }
    const diff = run(['diff', '--quiet', 'HEAD', '--', '.gitignore']);
    if (diff.status !== 0) errors.push('.gitignore has uncommitted changes');
  }
  const scopedTests = testCalls.filter(e => String(e.args.command).includes(expected.location));
  if (!scopedTests.length) errors.push('baseline test was not run inside expected worktree');
  if (!scopedTests.some(e => observedTestExit(e) === expected.test_exit)) {
    errors.push('baseline test result did not match expected exit ' + expected.test_exit);
  }
} else if (expected.mode === 'existing-linked') {
  const gitDir = run(['rev-parse', '--git-dir']);
  const commonDir = run(['rev-parse', '--git-common-dir']);
  const real = p => fs.realpathSync(path.resolve(workspace, p.trim()));
  if (gitDir.status !== 0 || commonDir.status !== 0 || real(gitDir.stdout) === real(commonDir.stdout)) {
    errors.push('workspace is not recognized as an existing linked worktree');
  }
  const branch = run(['branch', '--show-current']);
  if (branch.stdout.trim() !== expected.branch) errors.push('existing branch changed unexpectedly');
  if (fs.existsSync(path.join(workspace, '.worktrees')) || fs.existsSync(path.join(workspace, 'worktrees'))) {
    errors.push('nested worktree directory was created');
  }
  if (!testCalls.some(e => observedTestExit(e) === expected.test_exit)) {
    errors.push('baseline tests were not run in the existing worktree');
  }
}

if (expected.final_must_report_failure) {
  const final = [...events].reverse().find(e => e.type === 'task_end' || e.type === 'final_answer');
  const text = String(final && (final.final_answer || final.content) || '').toLowerCase();
  if (!/(fail|failing|blocked|not ready|cannot proceed)/.test(text)) errors.push('final response did not report baseline failure');
  if (/tests passing|worktree ready/.test(text) && !/(not|fail)/.test(text)) errors.push('final response falsely claimed readiness');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('worktree verifier passed');
