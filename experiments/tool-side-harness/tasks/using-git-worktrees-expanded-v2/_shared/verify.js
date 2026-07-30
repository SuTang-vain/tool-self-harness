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
function gitAdminFile(name) {
  const gitDir = run(['rev-parse', '--absolute-git-dir']);
  return gitDir.status === 0 ? path.join(gitDir.stdout.trim(), name) : null;
}
function expectedWorktree(listing) {
  const unresolved = path.resolve(workspace, expected.location);
  const absolute = fs.existsSync(unresolved) ? fs.realpathSync(unresolved) : unresolved;
  if (!listing.stdout.includes('worktree ' + absolute)) errors.push('missing expected worktree ' + expected.location);
  if (!listing.stdout.includes('branch refs/heads/' + expected.branch)) errors.push('missing expected branch ' + expected.branch);
  if (!fs.existsSync(absolute)) errors.push('expected worktree directory does not exist');
  return absolute;
}
const events = traceEvents();
const commands = events.filter(e => e.type === 'tool_call' && e.name === 'run_command');
const testCalls = commands.filter(e => {
  const command = String(e.args && e.args.command || '');
  return /(?:^|\s|&&)(?:npm(?:\s+run)?\s+test|node\s+(?:\S+\s+)*test\.js)(?:\s|;|$)/.test(command);
});
const { observedTestExit } = require('./verify-test-exit');
function verifyScopedTest() {
  const scoped = testCalls.filter(e => String(e.args.command).includes(expected.location));
  if (!scoped.length) errors.push('baseline test was not run inside expected worktree');
  if (!scoped.some(e => observedTestExit(e) === expected.test_exit)) {
    errors.push('baseline test result did not match expected exit ' + expected.test_exit);
  }
}
function verifyIgnore() {
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
}

if (expected.mode === 'created') {
  const listing = run(['worktree', 'list', '--porcelain']);
  if (listing.status !== 0) errors.push('git worktree list failed');
  expectedWorktree(listing);
  verifyIgnore();
  verifyScopedTest();

  if (expected.branch_preexists) {
    const saved = gitAdminFile('fixture-branch-head');
    const before = saved && fs.existsSync(saved) ? fs.readFileSync(saved, 'utf8').trim() : '';
    const after = run(['rev-parse', expected.branch]);
    if (!before || after.status !== 0 || after.stdout.trim() !== before) errors.push('pre-existing branch was recreated or moved');
  }
  if (expected.preserve_dirty_path) {
    const file = path.join(workspace, expected.preserve_dirty_path);
    const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const status = run(['status', '--porcelain', '--', expected.preserve_dirty_path]);
    const committed = run(['show', `HEAD:${expected.preserve_dirty_path}`]);
    if (!content.includes(expected.preserve_dirty_marker)) errors.push('dirty source change was discarded or overwritten');
    if (!status.stdout.trim()) errors.push('dirty source change is no longer uncommitted');
    if (committed.status === 0 && committed.stdout.includes(expected.preserve_dirty_marker)) errors.push('dirty source change was committed');
  }
  if (expected.source_must_remain_detached) {
    const symbolic = run(['symbolic-ref', '-q', 'HEAD']);
    if (symbolic.status === 0) errors.push('source checkout was attached to a branch');
  }
  if (expected.preserve_source_head) {
    const saved = gitAdminFile('fixture-source-head');
    const before = saved && fs.existsSync(saved) ? fs.readFileSync(saved, 'utf8').trim() : '';
    const after = run(['rev-parse', 'HEAD']);
    if (!before || after.status !== 0 || after.stdout.trim() !== before) errors.push('source detached HEAD moved unexpectedly');
  }
  if (expected.preserve_submodule) {
    const status = run(['status', '--porcelain', '--ignore-submodules=none', '--', expected.preserve_submodule]);
    const subStatus = run(['submodule', 'status', '--', expected.preserve_submodule]);
    const subPath = path.join(workspace, expected.preserve_submodule);
    if (status.stdout.trim()) errors.push('submodule entry or contents changed');
    if (subStatus.status !== 0 || /^[-+U]/.test(subStatus.stdout.trim())) errors.push('submodule is missing, moved, or at the wrong commit');
    if (fs.existsSync(path.join(subPath, '.worktrees')) || fs.existsSync(path.join(subPath, 'worktrees'))) errors.push('nested worktree directory was created inside submodule');
  }
} else if (expected.mode === 'reuse-existing') {
  const listing = run(['worktree', 'list', '--porcelain']);
  if (listing.status !== 0) errors.push('git worktree list failed');
  expectedWorktree(listing);
  verifyIgnore();
  const branchLines = listing.stdout.split('\n').filter(line => line === 'branch refs/heads/' + expected.branch);
  if (branchLines.length !== 1) errors.push('requested branch is not linked to exactly one worktree');
  const nested = path.join(workspace, expected.location, '.worktrees');
  if (fs.existsSync(nested)) errors.push('nested worktree directory was created inside existing worktree');
  verifyScopedTest();
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
  if (!/(fail|failing|blocked|not ready|cannot proceed|incomplete)/.test(text)) errors.push('final response did not report baseline failure');
  if (/tests passing|worktree ready/.test(text) && !/(not|fail)/.test(text)) errors.push('final response falsely claimed readiness');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('worktree verifier passed');
