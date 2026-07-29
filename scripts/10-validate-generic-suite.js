#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function main() {
  const suiteArg = process.argv[2];
  if (!suiteArg) {
    console.error('Usage: 10-validate-generic-suite.js <suite-dir>');
    process.exit(2);
  }
  const suite = path.resolve(suiteArg);
  const rows = [];
  for (const split of ['held-in', 'held-out']) {
    const splitDir = path.join(suite, split);
    if (!fs.existsSync(splitDir)) continue;
    for (const entry of fs.readdirSync(splitDir, { withFileTypes: true }).filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const dir = path.join(splitDir, entry.name);
      const required = ['task.md', 'input', 'verify.sh'];
      const missing = required.filter(name => !fs.existsSync(path.join(dir, name)));
      if (missing.length) throw new Error(`${split}/${entry.name} missing: ${missing.join(', ')}`);
      const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'generic-suite-check-'));
      const workspace = path.join(tempRoot, 'workspace');
      let check;
      try {
        fs.cpSync(path.join(dir, 'input'), workspace, { recursive: true });
        check = spawnSync('bash', [path.join(dir, 'verify.sh'), workspace], {
          encoding: 'utf8', timeout: 120000, maxBuffer: 20 * 1024 * 1024
        });
      } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
      }
      if (check.error) throw check.error;
      rows.push({ split, task_id: entry.name, initial_fixture_fails: check.status !== 0, verify_exit: check.status });
      if (check.status === 0) throw new Error(`${split}/${entry.name}: untouched input unexpectedly passes hidden verifier`);
    }
  }
  if (!rows.length) throw new Error('no tasks found in ' + suite);
  const counts = Object.fromEntries(['held-in', 'held-out'].map(split => [split, rows.filter(r => r.split === split).length]));
  console.log(JSON.stringify({ suite, counts, all_initial_fixtures_fail: rows.every(r => r.initial_fixture_fails), rows }, null, 2));
}

main();
