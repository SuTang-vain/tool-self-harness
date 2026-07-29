#!/usr/bin/env node
'use strict';
/*
 * 05-accept.js - apply the acceptance rule and merge accepted edits into lineage
 *
 * Usage: node 05-accept.js <config.yaml> <round-N>
 *
 * Implements the Proposal Validation acceptance (§3.4):
 *   accept(j) iff (P_in(j) > P_in(h_t) AND P_ho(j) >= P_ho(h_t))
 *              OR (P_ho(j) > P_ho(h_t) AND P_in(j) >= P_in(h_t))
 *
 *   - Edits that only trade off one split against the other are REJECTED.
 *   - Multiple compatible candidates (different surfaces) are MERGED.
 *   - Accepted edits are applied to the sandbox and committed as a git tag
 *     h<N> in the lineage. Rejected edits are logged but do not change the harness.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const patch = require('./lib/patch');

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

function readSurfaces(file) {
  const src = fs.readFileSync(file, 'utf8');
  const surfaces = []; let cur = null;
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

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function nextLineageTag(lineageDir) {
  // find existing tags h0, h1, ... in the lineage dir (stored as files mapping tag->commit)
  let max = -1;
  if (fs.existsSync(lineageDir)) {
    for (const f of fs.readdirSync(lineageDir)) {
      const m = /^h(\d+)$/.exec(f);
      if (m) max = Math.max(max, Number(m[1]));
    }
  }
  return 'h' + (max + 1);
}

function main() {
  const [, , configPath, roundId] = process.argv;
  if (!configPath || !roundId) {
    console.error('Usage: node 05-accept.js <config.yaml> <round-N>');
    process.exit(2);
  }
  const config = readYAML(configPath);
  const harnessRoot = path.dirname(path.resolve(configPath));
  const paths = config.paths || {};
  const sandboxPath = path.resolve(harnessRoot, paths.sandbox || 'sandbox');
  const lineageDir = path.resolve(harnessRoot, paths.lineage || 'lineage');
  const resultsPath = path.resolve(harnessRoot, paths.results || 'results', roundId + '.json');
  const propDir = path.resolve(harnessRoot, paths.proposals || 'proposals', roundId);
  const surfacesPath = path.resolve(harnessRoot, 'surfaces.yaml');
  const surfaces = readSurfaces(surfacesPath);

  if (!fs.existsSync(resultsPath)) {
    console.error('No results at ' + resultsPath + '. Run 04-validate first.');
    process.exit(1);
  }
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const baseline = results.baseline;
  if (!baseline) { console.error('No baseline in results.'); process.exit(1); }

  // Ensure sandbox is a git repo
  if (!fs.existsSync(path.join(sandboxPath, '.git'))) {
    console.log('Initializing git in sandbox...');
    git(['init'], sandboxPath);
    git(['add', '-A'], sandboxPath);
    git(['commit', '-m', 'initial harness h0', '--allow-empty'], sandboxPath);
    fs.mkdirSync(lineageDir, { recursive: true });
    const h0Commit = git(['rev-parse', 'HEAD'], sandboxPath).stdout;
    fs.writeFileSync(path.join(lineageDir, 'h0'), h0Commit + '\n');
  }

  // Evaluate each candidate against the acceptance rule
  const accepted = [];
  const rejected = [];
  for (const cand of results.candidates) {
    if (cand.status !== 'evaluated') { rejected.push({ ...cand, reason: 'not_evaluated' }); continue; }
    const improvesIn = cand.p_in > baseline.p_in;
    const improvesHo = cand.p_ho > baseline.p_ho;
    const degradesIn = cand.p_in < baseline.p_in;
    const degradesHo = cand.p_ho < baseline.p_ho;
    const accept = (improvesIn && !degradesHo) || (improvesHo && !degradesIn);
    const decision = {
      j: cand.j, surface_id: cand.surface_id,
      p_in: cand.p_in, p_ho: cand.p_ho,
      baseline_p_in: baseline.p_in, baseline_p_ho: baseline.p_ho,
      improves_in: improvesIn, improves_ho: improvesHo,
      degrades_in: degradesIn, degrades_ho: degradesHo,
      decision: accept ? 'accept' : 'reject',
      reason: accept
        ? (improvesIn && improvesHo ? 'improves both splits' : 'improves one split without degrading the other')
        : (degradesIn || degradesHo ? 'degrades a split' : 'no improvement (trade-off or flat)')
    };
    if (accept) accepted.push(decision); else rejected.push(decision);
    console.log('  candidate ' + cand.j + ' (' + cand.surface_id + '): P_in ' + cand.p_in + ' vs ' + baseline.p_in +
      ', P_ho ' + cand.p_ho + ' vs ' + baseline.p_ho + ' -> ' + decision.decision.toUpperCase() + ' (' + decision.reason + ')');
  }

  // Merge accepted edits (apply all to sandbox, single commit)
  let mergeReport = { accepted: [], rejected, merged: false };
  if (accepted.length > 0) {
    const tag = nextLineageTag(lineageDir);
    let skillMd = fs.readFileSync(path.join(sandboxPath, 'SKILL.md'), 'utf8');
    const wholeFileWrites = []; // collect {file, content} for whole-file surfaces
    for (const a of accepted) {
      const pJson = JSON.parse(fs.readFileSync(path.join(propDir, String(a.j), 'patch.json'), 'utf8'));
      const surface = surfaces.find(s => s.id === a.surface_id);
      if (!surface) { console.log('  [merge] surface ' + a.surface_id + ' not found, skipping'); continue; }
      try {
        const result = patch.applyPatch(skillMd, surface, pJson.new_content);
        if (result && result.__whole_file) {
          wholeFileWrites.push(result);
        } else {
          skillMd = result;
        }
        a.merged = true;
        console.log('  [merge] applied candidate ' + a.j + ' to ' + a.surface_id);
      } catch (e) {
        a.merge_error = e.message;
        console.log('  [merge] FAILED candidate ' + a.j + ': ' + e.message);
      }
    }
    fs.writeFileSync(path.join(sandboxPath, 'SKILL.md'), skillMd);
    for (const wf of wholeFileWrites) {
      fs.writeFileSync(path.join(sandboxPath, wf.file), wf.content);
    }
    git(['add', '-A'], sandboxPath);
    const commitMsg = 'harness ' + tag + ': merge ' + accepted.filter(a => a.merged).map(a => a.surface_id).join(', ') +
      '\n\nround: ' + roundId + '\naccepted: ' + JSON.stringify(accepted.map(a => ({ j: a.j, surface: a.surface_id, p_in: a.p_in, p_ho: a.p_ho })), null, 2);
    git(['commit', '-m', commitMsg, '--allow-empty'], sandboxPath);
    const commit = git(['rev-parse', 'HEAD'], sandboxPath).stdout;
    fs.writeFileSync(path.join(lineageDir, tag), commit + '\n');
    mergeReport.accepted = accepted;
    mergeReport.tag = tag;
    mergeReport.commit = commit;
    mergeReport.merged = true;
    console.log('\n=== Merged into lineage ' + tag + ' (commit ' + commit.slice(0, 8) + ') ===');
  } else {
    console.log('\n=== No candidates accepted this round. Harness unchanged. ===');
  }

  // Write acceptance report
  const reportPath = path.resolve(harnessRoot, paths.results || 'results', roundId + '-accept.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    round: roundId,
    baseline: { p_in: baseline.p_in, p_ho: baseline.p_ho, in_total: baseline.in_total, ho_total: baseline.ho_total },
    accepted: accepted,
    rejected: rejected,
    merge: mergeReport,
    generated_at: new Date().toISOString()
  }, null, 2) + '\n');
  console.log('Acceptance report: ' + reportPath);
}

main();
