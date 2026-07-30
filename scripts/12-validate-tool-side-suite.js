#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8', timeout: 120000, maxBuffer: 20 * 1024 * 1024, ...options
  });
  if (result.error) throw result.error;
  return result;
}

function initTask(taskDir, workspace) {
  fs.cpSync(path.join(taskDir, 'input'), workspace, { recursive: true });
  run('git', ['init', '-q'], { cwd: workspace });
  run('git', ['add', '-A'], { cwd: workspace });
  run('git', ['-c', 'user.name=Suite Validator', '-c', 'user.email=validator@example.invalid', 'commit', '-q', '-m', 'task baseline'], { cwd: workspace });
  const setup = path.join(taskDir, 'setup.sh');
  if (fs.existsSync(setup)) {
    const result = run('bash', [setup, workspace]);
    if (result.status !== 0) throw new Error('setup failed: ' + ((result.stdout || '') + (result.stderr || '')).trim());
  }
}

function verify(taskDir, workspace, trace) {
  return run('bash', [path.join(taskDir, 'verify.sh'), workspace, trace]);
}

function walkFiles(root) {
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else out.push(absolute);
    }
  }
  walk(root);
  return out;
}

function hashFiles(root, predicate) {
  const hash = crypto.createHash('sha256');
  for (const file of walkFiles(root).filter(file => predicate(path.relative(root, file)))) {
    hash.update(path.relative(root, file));
    hash.update('\0');
    hash.update(fs.readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function main() {
  const suiteArg = process.argv[2];
  if (!suiteArg) {
    console.error('Usage: 12-validate-tool-side-suite.js <suite-dir>');
    process.exit(2);
  }
  const suite = path.resolve(suiteArg);
  const rows = [];
  for (const split of ['held-in', 'held-out']) {
    const splitDir = path.join(suite, split);
    if (!fs.existsSync(splitDir)) continue;
    for (const entry of fs.readdirSync(splitDir, { withFileTypes: true }).filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const taskDir = path.join(splitDir, entry.name);
      const required = ['task.md', 'input', 'verify.sh', 'reference.sh'];
      const missing = required.filter(name => !fs.existsSync(path.join(taskDir, name)));
      if (missing.length) throw new Error(`${split}/${entry.name} missing: ${missing.join(', ')}`);
      const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tool-side-suite-check-'));
      try {
        const untouched = path.join(temp, 'untouched');
        const untouchedTrace = path.join(temp, 'untouched-trace.jsonl');
        initTask(taskDir, untouched);
        fs.writeFileSync(untouchedTrace, '');
        const initial = verify(taskDir, untouched, untouchedTrace);
        if (initial.status === 0) throw new Error(`${split}/${entry.name}: untouched fixture unexpectedly passes`);

        const repaired = path.join(temp, 'repaired');
        const repairedTrace = path.join(temp, 'repaired-trace.jsonl');
        initTask(taskDir, repaired);
        const repair = run('bash', [path.join(taskDir, 'reference.sh'), repaired, repairedTrace]);
        if (repair.status !== 0) throw new Error(`${split}/${entry.name}: reference repair failed: ` + ((repair.stdout || '') + (repair.stderr || '')).trim());
        const repairedCheck = verify(taskDir, repaired, repairedTrace);
        if (repairedCheck.status !== 0) throw new Error(`${split}/${entry.name}: repaired fixture fails: ` + ((repairedCheck.stdout || '') + (repairedCheck.stderr || '')).trim());
        rows.push({ split, task_id: entry.name, untouched: 'fail', reference: 'pass' });
      } finally {
        fs.rmSync(temp, { recursive: true, force: true });
      }
    }
  }
  if (!rows.length) throw new Error('no tasks found in ' + suite);
  const taskHash = hashFiles(suite, rel => /(^|\/)(task\.md|setup\.sh)$/.test(rel) || rel.includes('/input/'));
  const verifierHash = hashFiles(suite, rel => rel.includes('_shared/verify') || /(^|\/)(verify\.sh|expected\.json)$/.test(rel));
  const referenceHash = hashFiles(suite, rel => rel.includes('_shared/reference') || /(^|\/)reference\.sh$/.test(rel));
  console.log(JSON.stringify({
    suite,
    counts: {
      held_in: rows.filter(row => row.split === 'held-in').length,
      held_out: rows.filter(row => row.split === 'held-out').length
    },
    all_untouched_fail: rows.every(row => row.untouched === 'fail'),
    all_references_pass: rows.every(row => row.reference === 'pass'),
    task_tree_sha256: taskHash,
    verifier_sha256: verifierHash,
    reference_sha256: referenceHash,
    rows
  }, null, 2));
}

main();
