#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const { evaluate } = require('./lib/generic-acceptance');

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
