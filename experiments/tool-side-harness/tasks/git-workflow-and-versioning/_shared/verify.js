#!/usr/bin/env node
'use strict';
/*
 * verify.js — hidden grader for the git-workflow-and-versioning suite.
 * Usage: node verify.js <workspace> <trace> <expected.json>
 *
 * All checks are deterministic git-state assertions driven by expected.json:
 *   {"kind":"commits_after_baseline","min":N}
 *   {"kind":"each_new_commit_touches_one_file"}
 *   {"kind":"commit_messages_match","pattern":"^(feat|fix|...): .+"}
 *   {"kind":"current_branch_matches","pattern":"^feature/[a-z0-9-]+$"}
 *   {"kind":"not_staged_or_tracked","path":".env"}
 *   {"kind":"file_ignored","path":".env"}
 *   {"kind":"file_staged","path":"src/app.txt"}
 *   {"kind":"tag_exists","pattern":"^v2\\.0\\.0$"}
 *   {"kind":"file_contains","file":"CHANGELOG.md","pattern":"### Fixed"}
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const [workspaceArg, , expectedArg] = process.argv.slice(2);
if (!workspaceArg || !expectedArg) { console.error('usage: verify.js <workspace> <trace> <expected.json>'); process.exit(2); }
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const errors = [];

function git(args) {
  const r = spawnSync('git', args, { cwd: workspace, encoding: 'utf8' });
  return { code: r.status == null ? -1 : r.status, out: r.stdout || '', err: r.stderr || '' };
}

function commitsAfterBaseline() {
  const log = git(['log', '--oneline', '--format=%H|%s']);
  const lines = log.out.split('\n').filter(Boolean);
  const idx = lines.findIndex((l) => l.includes('task baseline'));
  return idx < 0 ? lines.length : idx;
}

for (const c of expected.checks || []) {
  switch (c.kind) {
    case 'commits_after_baseline': {
      const n = commitsAfterBaseline();
      if (n < c.min) errors.push('commits after baseline: ' + n + ' < ' + c.min);
      break;
    }
    case 'each_new_commit_touches_one_file': {
      const n = commitsAfterBaseline();
      for (let i = 0; i < n; i++) {
        const st = git(['show', '--stat', '--format=', 'HEAD~' + (n - 1 - i)]);
        const files = (st.out.match(/\n [^|\n]+ \|/g) || []).length;
        if (files > 1) errors.push('commit ' + i + ' touches ' + files + ' files (atomicity)');
      }
      break;
    }
    case 'commit_messages_match': {
      const n = commitsAfterBaseline();
      const re = new RegExp(c.pattern);
      for (let i = 0; i < n; i++) {
        const msg = git(['log', '-1', '--format=%s', 'HEAD~' + (n - 1 - i)]).out.trim();
        if (!re.test(msg)) errors.push('commit message "' + msg + '" does not match the project convention');
      }
      break;
    }
    case 'current_branch_matches': {
      const b = git(['branch', '--show-current']).out.trim();
      if (!new RegExp(c.pattern).test(b)) errors.push('branch "' + b + '" does not match the project convention');
      break;
    }
    case 'not_staged_or_tracked': {
      const staged = git(['diff', '--cached', '--name-only']).out;
      const tracked = git(['ls-files', c.path]).out;
      if (staged.split('\n').includes(c.path) || tracked.trim() === c.path) errors.push(c.path + ' is staged or tracked');
      break;
    }
    case 'file_ignored': {
      const r = git(['check-ignore', '-q', c.path]);
      if (r.code !== 0) errors.push(c.path + ' is not ignored');
      break;
    }
    case 'file_staged': {
      const staged = git(['diff', '--cached', '--name-only']).out;
      if (!staged.split('\n').includes(c.path)) errors.push(c.path + ' is not staged');
      break;
    }
    case 'tag_exists': {
      const tags = git(['tag']).out.split('\n').filter(Boolean);
      if (!tags.some((t) => new RegExp(c.pattern).test(t))) errors.push('no tag matching ' + c.pattern);
      break;
    }
    case 'file_contains': {
      const p = path.join(workspace, c.file);
      if (!fs.existsSync(p)) { errors.push(c.file + ' missing'); break; }
      const content = fs.readFileSync(p, 'utf8');
      if (!new RegExp(c.pattern, 'm').test(content)) errors.push(c.file + ' does not match /' + c.pattern + '/');
      break;
    }
    default:
      errors.push('unknown check kind: ' + c.kind);
  }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('git-workflow verifier passed');
