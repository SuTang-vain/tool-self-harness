#!/usr/bin/env node
'use strict';

// Evaluate no-skill/minimal/full procedural-skill variants on generic tasks.
// Each attempt receives a fresh isolated copy of task/input and is verified by
// task/verify.sh outside the model-visible workspace.

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

function parseTrace(tracePath) {
  if (!fs.existsSync(tracePath)) return {};
  const events = fs.readFileSync(tracePath, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
  const calls = events.filter(e => e.type === 'tool_call');
  const firstWrite = calls.findIndex(e => e.name === 'write_file' || e.name === 'edit_file');
  const testCalls = calls.map((e, index) => ({ e, index })).filter(({ e }) =>
    e.name === 'run_command' && /(?:^|\s)(?:npm test|node .*test|python\d* -m unittest|pytest|go test|cargo test)(?:\s|$)/i.test((e.args && e.args.command) || '')
  );
  return {
    steps: calls.length,
    loaded_skill: calls.some(e => e.name === 'load_skill'),
    read_skill_reference: calls.some(e => e.name === 'read_skill_file'),
    ran_tests: testCalls.length > 0,
    test_before_first_edit: testCalls.some(({ index }) => firstWrite < 0 || index < firstWrite),
    test_after_last_edit: (() => {
      const lastWrite = Math.max(-1, ...calls.map((e, i) => (e.name === 'write_file' || e.name === 'edit_file') ? i : -1));
      return testCalls.some(({ index }) => index > lastWrite);
    })(),
    final_answer: (events.find(e => e.type === 'final_answer') || {}).content || null,
    task_error: (events.find(e => e.type === 'task_end') || {}).error || null
  };
}

function listTasks(suiteDir) {
  const tasks = [];
  for (const split of ['held-in', 'held-out']) {
    const dir = path.join(suiteDir, split);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const taskDir = path.join(dir, entry.name);
      if (fs.existsSync(path.join(taskDir, 'task.md')) && fs.existsSync(path.join(taskDir, 'verify.sh'))) {
        tasks.push({ split, id: entry.name, dir: taskDir });
      }
    }
  }
  return tasks;
}

function initWorkspace(task, workspace) {
  fs.mkdirSync(path.dirname(workspace), { recursive: true });
  fs.cpSync(path.join(task.dir, 'input'), workspace, { recursive: true });
  spawnSync('git', ['init', '-q'], { cwd: workspace });
  spawnSync('git', ['add', '-A'], { cwd: workspace });
  spawnSync('git', ['-c', 'user.name=Self Harness', '-c', 'user.email=self-harness@example.invalid', 'commit', '-q', '-m', 'task baseline'], { cwd: workspace });
}

function verifyAttempt(args, task, repeat, workspace, tracePath, summary) {
  const verifier = spawnSync('bash', [path.join(task.dir, 'verify.sh'), workspace], {
    encoding: 'utf8', timeout: 120000, maxBuffer: 20 * 1024 * 1024
  });
  return {
    split: task.split,
    task_id: task.id,
    repeat,
    pass: verifier.status === 0,
    verify_exit: verifier.status == null ? -1 : verifier.status,
    verify_msg: ((verifier.stdout || '') + (verifier.stderr || '')).trim().split('\n').slice(-5).join(' | '),
    runner: summary,
    behavior: parseTrace(tracePath),
    workspace,
    trace_path: tracePath
  };
}

function completedTraceSummary(tracePath) {
  if (!fs.existsSync(tracePath)) return null;
  try {
    const events = fs.readFileSync(tracePath, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
    const end = [...events].reverse().find(event => event.type === 'task_end');
    if (!end || end.error) return null;
    return { steps: end.steps, final_answer: end.final_answer, error: null, trace_path: tracePath };
  } catch (_) {
    return null;
  }
}

function runAttempt(args, task, repeat) {
  return new Promise(resolve => {
    const attemptDir = path.join(args.runDir, 'rep-' + repeat, task.split, task.id);
    const workspace = path.join(attemptDir, 'workspace');
    const tracePath = path.join(attemptDir, 'trace.jsonl');
    const checkpoint = path.join(attemptDir, 'attempt-result.json');
    if (fs.existsSync(checkpoint)) {
      resolve(JSON.parse(fs.readFileSync(checkpoint, 'utf8')));
      return;
    }
    const recovered = completedTraceSummary(tracePath);
    if (recovered && fs.existsSync(workspace)) {
      const result = verifyAttempt(args, task, repeat, workspace, tracePath, recovered);
      fs.writeFileSync(checkpoint, JSON.stringify(result, null, 2) + '\n');
      resolve(result);
      return;
    }
    if (fs.existsSync(workspace)) fs.rmSync(workspace, { recursive: true, force: true });
    if (fs.existsSync(tracePath)) fs.rmSync(tracePath, { force: true });
    initWorkspace(task, workspace);
    const runner = path.join(args.root, 'scripts', 'lib', 'generic-runner.js');
    const child = spawn(process.execPath, [
      runner, args.modelConfig, args.skillRepo, path.join(task.dir, 'task.md'), workspace, tracePath, String(args.maxSteps)
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', data => stdout += data);
    child.stderr.on('data', data => stderr += data);
    child.on('close', status => {
      let summary = {};
      try { summary = JSON.parse(stdout.split('\n').filter(Boolean).pop() || '{}'); } catch (_) {}
      if (status !== 0 || (summary.error && String(summary.error).startsWith('api_error'))) {
        resolve({ fatal: true, task, repeat, error: summary.error || stderr.slice(0, 500) || 'runner exit ' + status });
        return;
      }
      const result = verifyAttempt(args, task, repeat, workspace, tracePath, summary);
      fs.writeFileSync(checkpoint, JSON.stringify(result, null, 2) + '\n');
      resolve(result);
    });
  });
}

async function pool(items, concurrency, fn) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return output;
}

async function main() {
  const [modelConfigArg, suiteArg, variant, skillArg, runId, repeatsArg, concurrencyArg, seedArg, taskFilterArg] = process.argv.slice(2);
  if (!modelConfigArg || !suiteArg || !variant || !skillArg || !runId) {
    console.error('Usage: 06-run-skill-benchmark.js <model-config> <suite-dir> <variant> <skill-repo|none> <run-id> [repeats=2] [concurrency=2] [seed] [task-filter comma-list]');
    process.exit(2);
  }
  const root = path.resolve(__dirname, '..');
  const modelConfig = path.resolve(modelConfigArg);
  const suiteDir = path.resolve(suiteArg);
  const skillRepo = skillArg === 'none' ? 'none' : path.resolve(skillArg);
  const repeats = Math.max(1, Number(repeatsArg || 2));
  const concurrency = Math.max(1, Number(concurrencyArg || 2));
  const seed = seedArg == null ? null : Number(seedArg);
  const taskFilter = taskFilterArg ? new Set(taskFilterArg.split(',').map(value => value.trim()).filter(Boolean)) : null;
  const runDir = path.join(root, 'runs', 'general-skills', runId, variant);
  const resultDir = path.join(root, 'results', 'general-skills', runId);
  const allTasks = listTasks(suiteDir);
  const tasks = taskFilter ? allTasks.filter(task => taskFilter.has(task.id)) : allTasks;
  if (tasks.length === 0) throw new Error('no tasks found in ' + suiteDir);
  if (taskFilter && tasks.length !== taskFilter.size) {
    const found = new Set(tasks.map(task => task.id));
    throw new Error('task filter contains unknown task(s): ' + [...taskFilter].filter(id => !found.has(id)).join(','));
  }
  const attempts = [];
  for (let repeat = 0; repeat < repeats; repeat++) for (const task of tasks) attempts.push({ task, repeat });
  if (seed != null && Number.isFinite(seed)) {
    let state = Math.trunc(seed) >>> 0;
    const random = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 0x100000000; };
    for (let i = attempts.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [attempts[i], attempts[j]] = [attempts[j], attempts[i]];
    }
  }
  console.log('Running ' + attempts.length + ' attempts: variant=' + variant + ' tasks=' + tasks.length + ' repeats=' + repeats);
  const ctx = { root, modelConfig, skillRepo, runDir, maxSteps: 30 };
  const results = await pool(attempts, concurrency, item => runAttempt(ctx, item.task, item.repeat));
  const fatal = results.find(r => r.fatal);
  if (fatal) throw new Error('fatal attempt ' + fatal.task.id + '/rep' + fatal.repeat + ': ' + fatal.error);

  const perTask = tasks.map(task => {
    const rows = results.filter(r => r.task_id === task.id && r.split === task.split);
    return {
      split: task.split,
      task_id: task.id,
      passes: rows.filter(r => r.pass).length,
      attempts: rows.length,
      stable_pass: rows.every(r => r.pass),
      rows
    };
  });
  const summarizeSplit = split => {
    const rows = results.filter(r => r.split === split);
    const taskRows = perTask.filter(r => r.split === split);
    return {
      passes: rows.filter(r => r.pass).length,
      attempts: rows.length,
      pass_rate: rows.length ? rows.filter(r => r.pass).length / rows.length : 0,
      stable_tasks: taskRows.filter(r => r.stable_pass).map(r => r.task_id),
      stable_task_count: taskRows.filter(r => r.stable_pass).length,
      task_count: taskRows.length
    };
  };
  const metricRows = results.map(r => r.runner && r.runner.metrics ? r.runner.metrics : {});
  const sumMetric = key => metricRows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
  const totalTokens = sumMetric('total_tokens');
  const totalPasses = results.filter(r => r.pass).length;
  const totalStableTasks = perTask.filter(r => r.stable_pass).length;
  const metrics = {
    attempts: results.length,
    usage_coverage: results.length ? metricRows.filter(row => row.usage_observations > 0).length / results.length : 0,
    api_calls: sumMetric('api_calls'),
    api_latency_ms: sumMetric('api_latency_ms'),
    tool_calls: sumMetric('tool_calls'),
    tool_call_retries: sumMetric('tool_call_retries'),
    prompt_tokens: sumMetric('prompt_tokens'),
    completion_tokens: sumMetric('completion_tokens'),
    total_tokens: totalTokens,
    elapsed_ms: sumMetric('elapsed_ms'),
    mean_tokens_per_attempt: results.length ? totalTokens / results.length : 0,
    mean_tool_calls_per_attempt: results.length ? sumMetric('tool_calls') / results.length : 0,
    mean_elapsed_ms_per_attempt: results.length ? sumMetric('elapsed_ms') / results.length : 0,
    tokens_per_successful_attempt: totalPasses ? totalTokens / totalPasses : null,
    tokens_per_reliable_task: totalStableTasks ? totalTokens / totalStableTasks : null
  };
  const report = {
    run_id: runId,
    variant,
    model_config: modelConfig,
    skill_repo: skillRepo,
    suite: suiteDir,
    repeats,
    task_order_seed: seed,
    task_filter: taskFilter ? [...taskFilter].sort() : null,
    held_in: summarizeSplit('held-in'),
    held_out: summarizeSplit('held-out'),
    metrics,
    behavior: {
      loaded_skill_rate: results.filter(r => r.behavior.loaded_skill).length / results.length,
      test_before_edit_rate: results.filter(r => r.behavior.test_before_first_edit).length / results.length,
      test_after_edit_rate: results.filter(r => r.behavior.test_after_last_edit).length / results.length
    },
    per_task: perTask,
    generated_at: new Date().toISOString()
  };
  fs.mkdirSync(resultDir, { recursive: true });
  const outputPath = path.join(resultDir, variant + '.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log('held-in ' + report.held_in.passes + '/' + report.held_in.attempts + ' stable=' + report.held_in.stable_task_count + '/' + report.held_in.task_count);
  console.log('held-out ' + report.held_out.passes + '/' + report.held_out.attempts + ' stable=' + report.held_out.stable_task_count + '/' + report.held_out.task_count);
  console.log('result: ' + outputPath);
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
