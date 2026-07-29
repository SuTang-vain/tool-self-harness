#!/usr/bin/env node
'use strict';
/*
 * 01-run-round.js - run the current harness on a split of tasks (concurrent + cached)
 *
 * Usage: node 01-run-round.js <config.yaml> <round-N> <split> [--concurrency N] [--no-cache]
 *   split = held-in | held-out | all
 *
 * Improvements over serial version:
 *   - Concurrent task execution (default 3 workers; GLM-5.2 endpoint supports it)
 *   - Result caching by (sandbox SKILL.md hash, task_id): if the harness hasn't
 *     changed since the last run, reuse the cached trace + verify result instead
 *     of re-running. This makes 04-validate's baseline reuse 01's results.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

function readYAML(file) {
  const src = fs.readFileSync(file, 'utf8');
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const m = /^(\s*)([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw);
    if (!m) continue;
    const key = m[2]; let val = m[3].replace(/#.*$/, '').trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (val === '') { const child = {}; parent[key] = child; stack.push({ indent, obj: child }); }
    else { if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1); parent[key] = val; }
  }
  return root;
}

// ---------- run one task (returns a result record) ----------
function runOneTask(configPath, taskDir, split, taskId, roundId, harnessRoot, paths, sandboxPath, useCache) {
  // Compute cache key from sandbox SKILL.md hash + task_id
  const skillMdPath = path.join(sandboxPath, 'SKILL.md');
  const skillMd = fs.readFileSync(skillMdPath, 'utf8');
  const cacheKey = crypto.createHash('sha1').update(skillMd).digest('hex').slice(0, 16);
  const cacheDir = path.resolve(harnessRoot, paths.runs || 'runs', 'cache', cacheKey);
  const cacheFile = path.join(cacheDir, taskId + '.json');

  if (useCache && fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    // Restore the produced data.json from cache if it existed
    if (cached.verify.produced_file && cached.produced_pack) {
      const dataDir = path.join(taskDir, 'input', 'lib', 'data');
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(path.join(dataDir, 'data.json'), cached.produced_pack);
    }
    return { ...cached, cached: true };
  }

  // Reset input/ to pristine (remove model-generated files)
  const inputDataDir = path.join(taskDir, 'input', 'lib', 'data');
  if (fs.existsSync(inputDataDir)) {
    for (const f of fs.readdirSync(inputDataDir)) fs.unlinkSync(path.join(inputDataDir, f));
  }
  const keep = new Set(['task.md', 'verify.sh', 'expected', 'input']);
  for (const f of fs.readdirSync(taskDir)) {
    if (!keep.has(f) && !f.startsWith('.')) {
      try { fs.unlinkSync(path.join(taskDir, f)); } catch (e) {}
    }
  }

  // Run the runner (spawn async for concurrency)
  return new Promise((resolve) => {
    const traceDir = path.resolve(harnessRoot, paths.runs || 'runs', roundId, taskId);
    fs.mkdirSync(traceDir, { recursive: true });
    const tracePath = path.join(traceDir, 'trace.jsonl');
    const runnerScript = path.join(harnessRoot, 'scripts', 'lib', 'runner.js');

    const child = spawn(process.execPath, [runnerScript, configPath, taskDir, tracePath, '--skill-repo', sandboxPath], {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => stdout += d);
    child.stderr.on('data', d => stderr += d);
    child.on('close', () => {
      let runnerSummary = null;
      try { runnerSummary = JSON.parse(stdout.split('\n').filter(Boolean).pop() || '{}'); } catch (e) {}

      // Verify
      let verifyStatus = 'no_pack';
      let verifyMsg = '';
      const produced = path.join(taskDir, 'input', 'lib', 'data', 'data.json');
      const verifySh = path.join(taskDir, 'verify.sh');
      let producedPack = null;
      if (fs.existsSync(produced) && fs.existsSync(verifySh)) {
        const v = spawnSync('bash', [verifySh, produced], {
          encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
          env: { ...process.env, SG_DATA_PACK_SKILL: path.join(sandboxPath, 'scripts', 'sg-data-pack') }
        });
        verifyStatus = v.status === 0 ? 'pass' : 'fail';
        verifyMsg = ((v.stdout || '') + (v.stderr || '')).trim().split('\n').slice(-3).join(' | ');
        if (fs.existsSync(produced)) producedPack = fs.readFileSync(produced, 'utf8');
      } else if (!fs.existsSync(produced)) {
        verifyMsg = 'no data.json produced';
      }

      const record = {
        split, task_id: taskId, task_dir: taskDir, trace_path: tracePath,
        runner: { steps: runnerSummary ? runnerSummary.steps : null, error: runnerSummary ? runnerSummary.error : stderr.slice(0, 300) },
        verify: { status: verifyStatus, msg: verifyMsg, produced_file: fs.existsSync(produced) },
        round: roundId, cached: false,
        cache_key: cacheKey,
        produced_pack: producedPack
      };

      // Write cache
      if (useCache) {
        fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(cacheFile, JSON.stringify(record) + '\n');
      }

      resolve(record);
    });
  });
}

// ---------- concurrent worker pool ----------
async function runAll(tasks, concurrency, fn) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await fn(tasks[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const argv = process.argv.slice(2);
  const configPath = argv[0];
  const roundId = argv[1];
  const splitArg = argv[2];
  if (!configPath || !roundId || !splitArg) {
    console.error('Usage: node 01-run-round.js <config.yaml> <round-N> <held-in|held-out|all> [--concurrency N] [--no-cache]');
    process.exit(2);
  }
  let concurrency = 3;
  let useCache = true;
  for (let i = 3; i < argv.length; i++) {
    if (argv[i] === '--concurrency' && argv[i + 1]) concurrency = Number(argv[++i]);
    else if (argv[i] === '--no-cache') useCache = false;
  }

  const config = readYAML(configPath);
  const harnessRoot = path.dirname(path.resolve(configPath));
  const paths = config.paths || {};
  const sandboxPath = path.resolve(harnessRoot, paths.sandbox || 'sandbox');

  const splits = splitArg === 'all' ? ['held-in', 'held-out'] : [splitArg];
  const runDir = path.resolve(harnessRoot, paths.runs || 'runs', roundId);
  fs.mkdirSync(runDir, { recursive: true });

  // Collect all tasks to run
  const allTasks = [];
  for (const split of splits) {
    const tasksDir = path.resolve(harnessRoot, paths['tasks_' + split.replace('-', '_')] || path.join('tasks', split));
    if (!fs.existsSync(tasksDir)) continue;
    const taskDirs = fs.readdirSync(tasksDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && fs.existsSync(path.join(tasksDir, d.name, 'task.md')))
      .map(d => d.name).sort();
    for (const taskId of taskDirs) {
      allTasks.push({ split, taskId, taskDir: path.join(tasksDir, taskId) });
    }
  }

  console.log('Running ' + allTasks.length + ' tasks (concurrency=' + concurrency + ', cache=' + useCache + ')...');

  // Run concurrently
  const results = await runAll(allTasks, concurrency, async (t) => {
    const r = await runOneTask(configPath, t.taskDir, t.split, t.taskId, roundId, harnessRoot, paths, sandboxPath, useCache);
    const tag = r.cached ? '[cached]' : '[ran]';
    console.log('  ' + tag + ' ' + t.split + '/' + t.taskId + ': ' + r.verify.status + ' (steps=' + (r.runner.steps || '?') + ') ' + r.verify.msg.slice(0, 60));
    return r;
  });

  const resultsPath = path.join(runDir, 'results.json');
  // Strip produced_pack from results.json (it's in the cache files)
  const slimResults = results.map(r => {
    const { produced_pack, ...rest } = r;
    return rest;
  });
  fs.writeFileSync(resultsPath, JSON.stringify(slimResults, null, 2) + '\n');
  const passed = results.filter(r => r.verify.status === 'pass').length;
  console.log('\n=== Round ' + roundId + ' summary: ' + passed + '/' + results.length + ' passed ===');
  console.log('Results: ' + resultsPath);
}

main().catch(e => { console.error(e); process.exit(1); });
