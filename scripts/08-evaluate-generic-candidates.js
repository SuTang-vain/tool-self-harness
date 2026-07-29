#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function set(values) { return new Set(values || []); }
function difference(a, b) { return [...a].filter(x => !b.has(x)).sort(); }

function evaluate(baseline, candidate) {
  const improvesIn = candidate.held_in.passes > baseline.held_in.passes;
  const improvesHo = candidate.held_out.passes > baseline.held_out.passes;
  const degradesIn = candidate.held_in.passes < baseline.held_in.passes;
  const degradesHo = candidate.held_out.passes < baseline.held_out.passes;
  const paperAccept = (improvesIn && !degradesHo) || (improvesHo && !degradesIn);

  const baseIn = set(baseline.held_in.stable_tasks);
  const baseHo = set(baseline.held_out.stable_tasks);
  const candIn = set(candidate.held_in.stable_tasks);
  const candHo = set(candidate.held_out.stable_tasks);
  const gainedIn = difference(candIn, baseIn);
  const gainedHo = difference(candHo, baseHo);
  const lostIn = difference(baseIn, candIn);
  const lostHo = difference(baseHo, candHo);
  const stableImproves = gainedIn.length + gainedHo.length > 0;
  const stableRegresses = lostIn.length + lostHo.length > 0;
  const stableAccept = stableImproves && !stableRegresses && !degradesIn && !degradesHo;

  return {
    paper_gate: {
      decision: paperAccept ? 'accept' : 'reject',
      improves_in: improvesIn,
      improves_ho: improvesHo,
      degrades_in: degradesIn,
      degrades_ho: degradesHo,
      baseline: { held_in: baseline.held_in.passes, held_out: baseline.held_out.passes },
      candidate: { held_in: candidate.held_in.passes, held_out: candidate.held_out.passes }
    },
    stable_gate: {
      decision: stableAccept ? 'accept' : 'reject',
      gained_in: gainedIn,
      gained_ho: gainedHo,
      lost_in: lostIn,
      lost_ho: lostHo,
      mean_degrades_in: degradesIn,
      mean_degrades_ho: degradesHo,
      baseline: { held_in: [...baseIn].sort(), held_out: [...baseHo].sort() },
      candidate: { held_in: [...candIn].sort(), held_out: [...candHo].sort() }
    },
    promote: stableAccept
  };
}

function main() {
  const [baselinePath, candidateDir, outputPath] = process.argv.slice(2);
  if (!baselinePath || !candidateDir || !outputPath) {
    console.error('Usage: 08-evaluate-generic-candidates.js <baseline.json> <candidate-dir> <output.json>');
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const candidates = fs.readdirSync(candidateDir)
    .filter(name => /^candidate-\d+\.json$/.test(name))
    .sort()
    .map(name => {
      const result = JSON.parse(fs.readFileSync(path.join(candidateDir, name), 'utf8'));
      return { variant: result.variant, result: evaluate(baseline, result) };
    });
  const report = {
    baseline: baseline.variant,
    baseline_path: path.resolve(baselinePath),
    candidates,
    promoted: candidates.filter(c => c.result.promote).map(c => c.variant),
    generated_at: new Date().toISOString()
  };
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  for (const candidate of candidates) {
    console.log(candidate.variant + ': paper=' + candidate.result.paper_gate.decision +
      ' stable=' + candidate.result.stable_gate.decision +
      ' promote=' + candidate.result.promote);
  }
  console.log('promoted: ' + (report.promoted.join(', ') || '(none)'));
}
main();
