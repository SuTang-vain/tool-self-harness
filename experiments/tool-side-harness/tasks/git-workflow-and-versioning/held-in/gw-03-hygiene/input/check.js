'use strict';
/* Agent-facing checker: reports git-state violations without naming fixes. */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();
const expected = JSON.parse(fs.readFileSync(process.argv[3] || path.join(ws, 'check-expect.json'), 'utf8'));

function git(args) {
  const r = spawnSync('git', args, { cwd: ws, encoding: 'utf8' });
  return { code: r.status == null ? -1 : r.status, out: r.stdout || '' };
}
const errors = [];
for (const c of expected.checks || []) {
  switch (c.kind) {
    case 'commits_after_baseline': {
      const lines = git(['log', '--oneline', '--format=%H|%s']).out.split('\n').filter(Boolean);
      const idx = lines.findIndex((l) => l.includes('task baseline'));
      const n = idx < 0 ? lines.length : idx;
      if (n < c.min) errors.push('too few commits after the baseline (' + n + ' < ' + c.min + ')');
      break;
    }
    case 'not_staged_or_tracked': {
      const staged = git(['diff', '--cached', '--name-only']).out;
      const tracked = git(['ls-files', c.path]).out;
      if (staged.split('\n').includes(c.path) || tracked.trim() === c.path) errors.push(c.path + ' is staged or tracked');
      break;
    }
    case 'file_staged': {
      if (!git(['diff', '--cached', '--name-only']).out.split('\n').includes(c.path)) errors.push(c.path + ' is not staged');
      break;
    }
    default:
      break; // remaining rules are hidden-grader-only
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('git-state checks pass');
