#!/usr/bin/env node
'use strict';
/*
 * 02-mine-weakness.js - cluster failed traces into an evidence bundle
 *
 * Usage: node 02-mine-weakness.js <config.yaml> <round-N>
 *
 * Reads:  runs/<round>/results.json   (per-task verify status + trace path)
 * Writes: evidence/<round>.json       (clustered failure patterns)
 *
 * Implements the Weakness Mining stage (§3.2):
 *   - For each failed task, build a failure signature (terminal_cause,
 *     implicated_surface, agent_behavior) via trace.js.
 *   - Cluster by exact agreement of (terminal_cause, implicated_surface).
 *   - Order clusters by size (support) so the proposer sees dominant
 *     patterns first.
 *
 * The evidence bundle does NOT prescribe a harness edit; it separates
 * verifier-level failure from the agent-level mechanism, leaving the
 * proposer to target a specific reusable weakness (§3.2 final paragraph).
 */
const fs = require('fs');
const path = require('path');
const trace = require('./lib/trace');

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
    if (val === '') {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      parent[key] = val;
    }
  }
  return root;
}

function main() {
  const [, , configPath, roundId] = process.argv;
  if (!configPath || !roundId) {
    console.error('Usage: node 02-mine-weakness.js <config.yaml> <round-N>');
    process.exit(2);
  }
  const config = readYAML(configPath);
  const harnessRoot = path.dirname(path.resolve(configPath));
  const paths = config.paths || {};
  const runsDir = path.resolve(harnessRoot, paths.runs || 'runs');
  const evidenceDir = path.resolve(harnessRoot, paths.evidence || 'evidence');

  const resultsPath = path.join(runsDir, roundId, 'results.json');
  if (!fs.existsSync(resultsPath)) {
    console.error('No results.json for ' + roundId + ' at ' + resultsPath);
    process.exit(1);
  }
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

  const signatures = [];
  for (const r of results) {
    if (r.verify.status === 'pass') {
      signatures.push({ task_id: r.task_id, split: r.split, passed: true });
      continue;
    }
    const sig = trace.buildSignature(r.trace_path, r.verify.status);
    signatures.push({
      task_id: r.task_id,
      split: r.split,
      passed: false,
      terminal_cause: sig.terminal_cause,
      agent_behavior: sig.agent_behavior,
      implicated_surface: sig.implicated_surface,
      attribution_note: sig.attribution_note,
      evidence: sig.evidence,
      steps: sig.steps
    });
  }

  // Cluster by (terminal_cause, implicated_surface) - exact match
  const clusters = {};
  for (const s of signatures.filter(s => !s.passed)) {
    const key = s.terminal_cause + '::' + s.implicated_surface;
    if (!clusters[key]) {
      clusters[key] = {
        cluster_id: key,
        terminal_cause: s.terminal_cause,
        implicated_surface: s.implicated_surface,
        attribution_note: s.attribution_note,
        task_ids: [],
        agent_behaviors: [],
        evidence_samples: [],
        total_steps: 0
      };
    }
    const c = clusters[key];
    c.task_ids.push(s.task_id);
    if (c.agent_behaviors.indexOf(s.agent_behavior) === -1) c.agent_behaviors.push(s.agent_behavior);
    if (c.evidence_samples.length < 2 && s.evidence) c.evidence_samples.push({ task_id: s.task_id, evidence: s.evidence });
    c.total_steps += (s.steps || 0);
  }

  // Order by support (cluster size), then by total steps
  const clusterList = Object.values(clusters).sort((a, b) => {
    if (b.task_ids.length !== a.task_ids.length) return b.task_ids.length - a.task_ids.length;
    return b.total_steps - a.total_steps;
  });

  const bundle = {
    round: roundId,
    total_tasks: signatures.length,
    passed: signatures.filter(s => s.passed).length,
    failed: signatures.filter(s => !s.passed).length,
    clusters: clusterList,
    per_task: signatures,
    generated_at: new Date().toISOString()
  };

  fs.mkdirSync(evidenceDir, { recursive: true });
  const outPath = path.join(evidenceDir, roundId + '.json');
  fs.writeFileSync(outPath, JSON.stringify(bundle, null, 2) + '\n');

  console.log('=== Evidence bundle for ' + roundId + ' ===');
  console.log('Tasks: ' + bundle.total_tasks + ' (passed ' + bundle.passed + ', failed ' + bundle.failed + ')');
  console.log('Clusters: ' + clusterList.length);
  for (const c of clusterList) {
    console.log('  [' + c.cluster_id + '] size=' + c.task_ids.length + ' tasks=[' + c.task_ids.join(',') + ']');
    console.log('    note: ' + c.attribution_note);
  }
  console.log('\nWritten: ' + outPath);
}

main();
