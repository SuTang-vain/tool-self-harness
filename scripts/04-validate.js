#!/usr/bin/env node
'use strict';
/*
 * 04-validate.js - regression-test each candidate harness edit
 *
 * Usage: node 04-validate.js <config.yaml> <round-N>
 *
 * Implements the Proposal Validation stage (§3.4):
 *   - For each proposal in proposals/<round>/:
 *       1. Apply the patch to a COPY of the sandbox SKILL.md
 *       2. Run 01-run-round on BOTH held-in and held-out splits with the patched skill
 *       3. Record split-wise pass counts: P_in, P_ho
 *   - Also run the current (unpatched) harness as the baseline: P_in(h_t), P_ho(h_t)
 *   - Write results/<round>.json with per-candidate split-wise outcomes
 *
 * The acceptance decision (accept/reject) is made by 05-accept.js.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const patch = require('./lib/patch');
const acceptance = require('./lib/acceptance');

function readYAML(file) {
  const src = fs.readFileSync(file, 'utf8');
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const m = /^(\s*)([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw);
    if (!m) continue;
    const key = m[2];
    let val = m[3].replace(/#.*$/, '').trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (val === '') { const child = {}; parent[key] = child; stack.push({ indent, obj: child }); }
    else { if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1); parent[key] = val; }
  }
  return root;
}

function readSurfaces(file) {
  const src = fs.readFileSync(file, 'utf8');
  const surfaces = [];
  let cur = null;
  for (const raw of src.split('\n')) {
    const im = /^\s*-\s+id:\s*(\S+)/.exec(raw);
    if (im) { if (cur) surfaces.push(cur); cur = { id: im[1] }; continue; }
    if (!cur) continue;
    const km = /^\s+(\w+):\s*(.*)$/.exec(raw);
    if (km) { const k = km[1]; let v = km[2].trim(); if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim().replace(/["']/g, '')); else if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); cur[k] = v; }
  }
  if (cur) surfaces.push(cur);
  return surfaces;
}

// Run 01-run-round on a given sandbox dir, return {p_in, p_ho, details}.
// Infrastructure/API failures abort validation instead of becoming synthetic 0-pass runs.
function runSplit(configPath, harnessRoot, paths, roundId, sandboxDir, label) {
  const tag = label + '-' + Date.now();
  const runScript = path.join(harnessRoot, 'scripts', '01-run-round.js');
  const tmpConfig = path.join(harnessRoot, '.tmp-config-' + tag + '.yaml');
  const cfgSrc = fs.readFileSync(configPath, 'utf8');
  const cfgMod = cfgSrc.replace(/^(\s*sandbox:\s*).*/m, '$1' + sandboxDir);
  fs.writeFileSync(tmpConfig, cfgMod);

  const out = [];
  try {
    for (const split of ['held-in', 'held-out']) {
      // Every validation repeat must be an independent model run. Reusing the
      // baseline cache would make rep1 a copy of rep0 and invalidate stability.
      const args = [runScript, tmpConfig, roundId + '-' + tag, split, '--concurrency', '3', '--no-cache'];
      const r = spawnSync(process.execPath, args, {
        encoding: 'utf8', maxBuffer: 200 * 1024 * 1024
      });
      const resultsPath = path.resolve(harnessRoot, paths.runs || 'runs', roundId + '-' + tag, 'results.json');
      if (r.status !== 0 || !fs.existsSync(resultsPath)) {
        throw new Error(
          '[' + label + '/' + split + '] runner failed: ' +
          ((r.stderr || r.stdout || 'no results.json').trim().slice(0, 500))
        );
      }

      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      if (results.length === 0) {
        throw new Error('[' + label + '/' + split + '] runner returned zero task results');
      }
      const apiFailures = results.filter(result =>
        result.runner && typeof result.runner.error === 'string' &&
        result.runner.error.startsWith('api_error')
      );
      if (apiFailures.length > 0) {
        const first = apiFailures[0];
        throw new Error(
          '[' + label + '/' + split + '] ' + apiFailures.length + ' API failure(s); first task ' +
          first.task_id + ': ' + first.runner.error.slice(0, 500)
        );
      }
      out.push({ split, results });
    }
  } finally {
    if (fs.existsSync(tmpConfig)) fs.unlinkSync(tmpConfig);
  }

  const inResults = out.find(o => o.split === 'held-in').results;
  const hoResults = out.find(o => o.split === 'held-out').results;
  return {
    p_in: inResults.filter(r => r.verify.status === 'pass').length,
    p_ho: hoResults.filter(r => r.verify.status === 'pass').length,
    in_total: inResults.length,
    ho_total: hoResults.length,
    details: out
  };
}

function main() {
  const [, , configPath, roundId] = process.argv;
  if (!configPath || !roundId) {
    console.error('Usage: node 04-validate.js <config.yaml> <round-N>');
    process.exit(2);
  }
  const config = readYAML(configPath);
  const harnessRoot = path.dirname(path.resolve(configPath));
  const paths = config.paths || {};
  const sandboxPath = path.resolve(harnessRoot, paths.sandbox || 'sandbox');
  const propDir = path.resolve(harnessRoot, paths.proposals || 'proposals', roundId);
  const surfacesPath = path.resolve(harnessRoot, 'surfaces.yaml');
  const surfaces = readSurfaces(surfacesPath);
  const evalRepeats = Number((config.loop || {}).eval_repeats || 1);

  // Run each repeat independently. Keep both aggregate counts and per-task
  // pass sets so 05-accept can distinguish stable fixes from lucky passes.
  function runSplitAggregated(configPath, harnessRoot, paths, roundId, sandboxDir, label) {
    const repeats = [];
    const repeatCount = Math.max(1, evalRepeats);
    for (let rep = 0; rep < repeatCount; rep++) {
      const r = runSplit(
        configPath,
        harnessRoot,
        paths,
        roundId,
        sandboxDir,
        label + '-rep' + rep
      );
      repeats.push(r);
    }

    const pIn = Math.max(...repeats.map(r => r.p_in));
    const pHo = Math.max(...repeats.map(r => r.p_ho));
    const stableIn = acceptance.stableTaskIds(repeats, 'held-in');
    const stableHo = acceptance.stableTaskIds(repeats, 'held-out');
    const bestIn = acceptance.bestTaskIds(repeats, 'held-in');
    const bestHo = acceptance.bestTaskIds(repeats, 'held-out');
    const repeatResults = acceptance.summarizeRepeats(repeats);

    return {
      p_in: pIn,
      p_ho: pHo,
      in_total: repeats[0].in_total,
      ho_total: repeats[0].ho_total,
      // Preserve the first repeat for backwards-compatible trace inspection.
      details: repeats[0].details,
      repeats: repeats.map(r => ({ p_in: r.p_in, p_ho: r.p_ho })),
      repeat_results: repeatResults,
      best_pass_tasks: {
        'held-in': bestIn,
        'held-out': bestHo
      },
      stable_pass_tasks: {
        'held-in': stableIn,
        'held-out': stableHo
      },
      // Keep the old flat fields for consumers that already use them.
      stable_in: stableIn,
      stable_ho: stableHo,
      stable_p_in: stableIn.length,
      stable_p_ho: stableHo.length,
      variance: {
        p_in_range: Math.max(...repeats.map(r => r.p_in)) - Math.min(...repeats.map(r => r.p_in)),
        p_ho_range: Math.max(...repeats.map(r => r.p_ho)) - Math.min(...repeats.map(r => r.p_ho))
      }
    };
  }

  if (!fs.existsSync(propDir)) {
    console.error('No proposals dir at ' + propDir + '. Run 03-propose first.');
    process.exit(1);
  }
  const proposalDirs = fs.readdirSync(propDir)
    .filter(d => /^\d+$/.test(d) && fs.existsSync(path.join(propDir, d, 'patch.json')))
    .sort((a, b) => Number(a) - Number(b));

  if (proposalDirs.length === 0) {
    console.log('No valid proposals to validate. Writing empty results.');
    fs.mkdirSync(path.resolve(harnessRoot, paths.results || 'results'), { recursive: true });
    fs.writeFileSync(path.resolve(harnessRoot, paths.results || 'results', roundId + '.json'),
      JSON.stringify({ round: roundId, baseline: null, candidates: [], generated_at: new Date().toISOString() }, null, 2) + '\n');
    process.exit(0);
  }

  const results = { round: roundId, baseline: null, candidates: [], generated_at: new Date().toISOString() };

  // 1. Baseline: current sandbox (unpatched)
  console.log('=== Baseline (current harness, repeats=' + evalRepeats + ') ===');
  results.baseline = runSplitAggregated(configPath, harnessRoot, paths, roundId, sandboxPath, 'baseline');
  console.log('  P_in=' + results.baseline.p_in + '/' + results.baseline.in_total +
    '  P_ho=' + results.baseline.p_ho + '/' + results.baseline.ho_total +
    (results.baseline.variance ? '  variance(in=' + results.baseline.variance.p_in_range + ',ho=' + results.baseline.variance.p_ho_range + ')' : '') +
    (results.baseline.stable_p_in != null ? '  stable(in=' + results.baseline.stable_p_in + ',ho=' + results.baseline.stable_p_ho + ')' : ''));

  // 2. Each candidate: apply patch to a temp copy, run splits
  const currentSkillMd = fs.readFileSync(path.join(sandboxPath, 'SKILL.md'), 'utf8');
  for (const j of proposalDirs) {
    const pJson = JSON.parse(fs.readFileSync(path.join(propDir, j, 'patch.json'), 'utf8'));
    const surface = surfaces.find(s => s.id === pJson.surface_id);
    if (!surface) { console.log('  [candidate ' + j + '] unknown surface, skipping'); continue; }

    console.log('\n=== Candidate ' + j + ' (surface=' + pJson.surface_id + ') ===');
    // Apply patch to a temp copy of the whole sandbox
    const tmpSandbox = path.resolve(harnessRoot, '.tmp-sandbox-cand-' + j + '-' + Date.now());
    spawnSync('cp', ['-r', sandboxPath, tmpSandbox], { encoding: 'utf8' });
    let patchedMd;
    try {
      patchedMd = patch.applyPatch(currentSkillMd, surface, pJson.new_content);
    } catch (e) {
      console.log('  [candidate ' + j + '] patch failed: ' + e.message);
      results.candidates.push({ j: Number(j), surface_id: pJson.surface_id, status: 'patch_failed', error: e.message });
      spawnSync('rm', ['-rf', tmpSandbox], { encoding: 'utf8' });
      continue;
    }
    // whole-file surface: write to the reference file in tmpSandbox
    if (patchedMd && patchedMd.__whole_file) {
      fs.writeFileSync(path.join(tmpSandbox, patchedMd.file), patchedMd.content);
    } else {
      fs.writeFileSync(path.join(tmpSandbox, 'SKILL.md'), patchedMd);
    }

    const candResult = runSplitAggregated(configPath, harnessRoot, paths, roundId, tmpSandbox, 'cand' + j);
    candResult.j = Number(j);
    candResult.surface_id = pJson.surface_id;
    candResult.status = 'evaluated';
    console.log('  P_in=' + candResult.p_in + '/' + candResult.in_total +
      '  P_ho=' + candResult.p_ho + '/' + candResult.ho_total +
      (candResult.variance ? '  variance(in=' + candResult.variance.p_in_range + ',ho=' + candResult.variance.p_ho_range + ')' : '') +
      (candResult.stable_p_in != null ? '  stable(in=' + candResult.stable_p_in + ',ho=' + candResult.stable_p_ho + ')' : ''));
    results.candidates.push(candResult);

    // Cleanup temp sandbox
    spawnSync('rm', ['-rf', tmpSandbox], { encoding: 'utf8' });
  }

  const resultsDir = path.resolve(harnessRoot, paths.results || 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const outPath = path.join(resultsDir, roundId + '.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n');
  console.log('\n=== Validation done. Results: ' + outPath + ' ===');
}

main();
