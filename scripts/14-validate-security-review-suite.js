#!/usr/bin/env node
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 120000, maxBuffer: 20 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  return result;
}
function initWorkspace(taskDir, workspace) {
  fs.cpSync(path.join(taskDir, 'input'), workspace, { recursive: true });
  run('git', ['init', '-q'], { cwd: workspace });
  run('git', ['add', '-A'], { cwd: workspace });
  const commit = run('git', ['-c', 'user.name=Security Suite', '-c', 'user.email=suite@example.invalid', 'commit', '-q', '-m', 'fixture baseline'], { cwd: workspace });
  if (commit.status !== 0) throw new Error('fixture commit failed: ' + ((commit.stdout || '') + (commit.stderr || '')).trim());
}
function walkFiles(root) {
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file); else out.push(file);
    }
  }
  walk(root); return out;
}
function hashFiles(root, predicate) {
  const hash = crypto.createHash('sha256');
  for (const file of walkFiles(root).filter(file => predicate(path.relative(root, file)))) {
    hash.update(path.relative(root, file)); hash.update('\0'); hash.update(fs.readFileSync(file)); hash.update('\0');
  }
  return hash.digest('hex');
}
function main() {
  const suiteArg = process.argv[2];
  if (!suiteArg) { console.error('Usage: 14-validate-security-review-suite.js <suite-dir>'); process.exit(2); }
  const suite = path.resolve(suiteArg);
  const manifestPath = path.join(suite, 'suite-manifest.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  const constraints = manifest.constraints || null;
  const rows = [];
  for (const split of ['held-in', 'held-out']) {
    const splitDir = path.join(suite, split);
    if (!fs.existsSync(splitDir)) continue;
    for (const entry of fs.readdirSync(splitDir, { withFileTypes: true }).filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const taskDir = path.join(splitDir, entry.name);
      const required = ['task.md', 'input', 'expected.json', 'verify.sh', 'reference.sh'];
      const missing = required.filter(name => !fs.existsSync(path.join(taskDir, name)));
      if (missing.length) throw new Error(`${split}/${entry.name} missing: ${missing.join(', ')}`);
      const expected = JSON.parse(fs.readFileSync(path.join(taskDir, 'expected.json'), 'utf8'));
      if (constraints) {
        const inputFiles = walkFiles(path.join(taskDir, 'input')).length;
        const findingCount = Array.isArray(expected.findings) ? expected.findings.length : 0;
        const decoyCount = Array.isArray(expected.protected_decoys) ? expected.protected_decoys.length : 0;
        if (inputFiles < constraints.input_files_min || inputFiles > constraints.input_files_max) throw new Error(`${split}/${entry.name}: input file count ${inputFiles} outside ${constraints.input_files_min}-${constraints.input_files_max}`);
        if (findingCount < constraints.true_findings_min || findingCount > constraints.true_findings_max) throw new Error(`${split}/${entry.name}: finding count ${findingCount} outside ${constraints.true_findings_min}-${constraints.true_findings_max}`);
        if (decoyCount < constraints.protected_decoys_min || decoyCount > constraints.protected_decoys_max) throw new Error(`${split}/${entry.name}: decoy count ${decoyCount} outside ${constraints.protected_decoys_min}-${constraints.protected_decoys_max}`);
        const relativeInput = walkFiles(path.join(taskDir, 'input')).map(file => path.relative(path.join(taskDir, 'input'), file)).sort();
        const scanned = [...(expected.scanned_files || [])].sort();
        if (JSON.stringify(relativeInput) !== JSON.stringify(scanned)) throw new Error(`${split}/${entry.name}: scanned_files must exactly cover all input files`);
      }
      const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'security-suite-check-'));
      try {
        const untouched = path.join(temp, 'untouched'); initWorkspace(taskDir, untouched);
        const initial = run('bash', [path.join(taskDir, 'verify.sh'), untouched]);
        if (initial.status === 0) throw new Error(`${split}/${entry.name}: untouched fixture unexpectedly passes`);
        const repaired = path.join(temp, 'repaired'); initWorkspace(taskDir, repaired);
        const repair = run('bash', [path.join(taskDir, 'reference.sh'), repaired]);
        if (repair.status !== 0) throw new Error(`${split}/${entry.name}: reference repair failed: ` + ((repair.stdout || '') + (repair.stderr || '')).trim());
        const check = run('bash', [path.join(taskDir, 'verify.sh'), repaired]);
        if (check.status !== 0) throw new Error(`${split}/${entry.name}: reference output fails: ` + ((check.stdout || '') + (check.stderr || '')).trim());
        rows.push({ split, task_id: entry.name, untouched: 'fail', reference: 'pass' });
      } finally { fs.rmSync(temp, { recursive: true, force: true }); }
    }
  }
  if (!rows.length) throw new Error('no tasks found in ' + suite);
  const taskHash = hashFiles(suite, rel => /(^|\/)(task\.md)$/.test(rel) || rel.includes('/input/'));
  const verifierHash = hashFiles(suite, rel => rel.includes('_shared/verify') || /(^|\/)(verify\.sh|expected\.json)$/.test(rel));
  const referenceHash = hashFiles(suite, rel => rel.includes('_shared/reference') || /(^|\/)reference\.sh$/.test(rel));
  console.log(JSON.stringify({
    suite,
    counts: { held_in: rows.filter(row => row.split === 'held-in').length, held_out: rows.filter(row => row.split === 'held-out').length },
    all_untouched_fail: rows.every(row => row.untouched === 'fail'),
    all_references_pass: rows.every(row => row.reference === 'pass'),
    task_tree_sha256: taskHash,
    verifier_sha256: verifierHash,
    reference_sha256: referenceHash,
    rows
  }, null, 2));
}
main();
