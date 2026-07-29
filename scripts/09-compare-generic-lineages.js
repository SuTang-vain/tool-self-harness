#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { evaluate, pairedAttemptSummary } = require('./lib/generic-acceptance');

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function main() {
  const [baselinePathArg, candidatePathArg, protocolPathArg, outputPathArg] = process.argv.slice(2);
  if (!baselinePathArg || !candidatePathArg || !protocolPathArg || !outputPathArg) {
    console.error('Usage: 09-compare-generic-lineages.js <baseline.json> <candidate.json> <protocol.md> <output.json>');
    process.exit(2);
  }
  const baselinePath = path.resolve(baselinePathArg);
  const candidatePath = path.resolve(candidatePathArg);
  const protocolPath = path.resolve(protocolPathArg);
  const outputPath = path.resolve(outputPathArg);
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
  if (baseline.repeats !== candidate.repeats) throw new Error('repeat count mismatch');
  const report = {
    comparison: baseline.variant + ' -> ' + candidate.variant,
    baseline_path: baselinePath,
    candidate_path: candidatePath,
    protocol_path: protocolPath,
    protocol_sha256: hashFile(protocolPath),
    repeats: baseline.repeats,
    gate_result: evaluate(baseline, candidate),
    paired_attempts: pairedAttemptSummary(baseline, candidate),
    generated_at: new Date().toISOString()
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log('paper gate: ' + report.gate_result.paper_gate.decision);
  console.log('reliable gate: ' + report.gate_result.reliable_gate.decision);
  console.log('paired candidate wins/losses: ' + report.paired_attempts.candidate_wins + '/' + report.paired_attempts.baseline_wins +
    ' (exact two-sided sign p=' + report.paired_attempts.exact_two_sided_sign_p + ')');
  console.log('result: ' + outputPath);
}

main();
