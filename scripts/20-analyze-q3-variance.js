#!/usr/bin/env node
'use strict';
// Q3 variance-control analysis: implements the frozen stratification rule
// in rounds/dsh-wp4-q3-variance-control/execution-plan.md (2026-08-16).
// Usage: 20-analyze-q3-variance.js <h0-result.json> <c2-result.json> <out.json>

const fs = require('fs');

function attempts(report) {
  const rows = [];
  for (const task of report.per_task || []) {
    for (const row of task.rows || []) {
      const metrics = (row.runner && row.runner.metrics) || {};
      const behavior = row.behavior || {};
      rows.push({
        task_id: task.task_id,
        split: task.split,
        pass: !!row.pass,
        total_tokens: Number(metrics.total_tokens || 0),
        steps: Number(behavior.steps || 0),
        loaded_skill: !!behavior.loaded_skill
      });
    }
  }
  return rows;
}

function pooledSd(a, b) {
  const va = a.length > 1 ? a.reduce((s, x) => s + Math.pow(x - a.reduce((t, y) => t + y, 0) / a.length, 2), 0) / (a.length - 1) : 0;
  const vb = b.length > 1 ? b.reduce((s, x) => s + Math.pow(x - b.reduce((t, y) => t + y, 0) / b.length, 2), 0) / (b.length - 1) : 0;
  if (a.length + b.length <= 2) return null;
  return Math.sqrt(((a.length - 1) * va + (b.length - 1) * vb) / (a.length + b.length - 2));
}

function mean(xs) { return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null; }

function stratumKey(row) {
  const ls = row.loaded_skill ? 'loaded' : 'not-loaded';
  const sb = row.steps <= 15 ? 'steps<=15' : 'steps>15';
  return ls + '|' + sb;
}

function main() {
  const [h0Path, c2Path, outPath] = process.argv.slice(2);
  if (!h0Path || !c2Path || !outPath) {
    console.error('Usage: 20-analyze-q3-variance.js <h0-result.json> <c2-result.json> <out.json>');
    process.exit(2);
  }
  const h0 = JSON.parse(fs.readFileSync(h0Path, 'utf8'));
  const c2 = JSON.parse(fs.readFileSync(c2Path, 'utf8'));
  const A = attempts(h0).filter(r => r.total_tokens > 0);
  const B = attempts(c2).filter(r => r.total_tokens > 0);
  const group = rows => rows.reduce((m, r) => { const k = stratumKey(r); (m[k] = m[k] || []).push(r.total_tokens); return m; }, {});
  const gA = group(A), gB = group(B);
  const strata = {};
  const otherA = [], otherB = [];
  for (const key of new Set([...Object.keys(gA), ...Object.keys(gB)])) {
    const a = gA[key] || [], b = gB[key] || [];
    if (a.length + b.length >= 4) strata[key] = { a, b };
    else { otherA.push(...a); otherB.push(...b); }
  }
  const verdicts = [];
  for (const [key, { a, b }] of Object.entries(strata)) {
    const mA = mean(a), mB = mean(b), sd = pooledSd(a, b);
    const diff = mA - mB;
    const measured = sd != null && Math.abs(diff) >= 1.5 * sd;
    verdicts.push({ stratum: key, nA: a.length, nB: b.length, meanA: mA, meanB: mB, diff, pooledSd: sd, criterion: measured ? 'MET' : 'not-met' });
  }
  const overall = {
    nA: A.length, nB: B.length,
    meanA: mean(A), meanB: mean(B),
    pooledSd: pooledSd(A, B),
    diff: mean(A) - mean(B),
    usageCoverageA: h0.metrics && h0.metrics.usage_coverage,
    usageCoverageB: c2.metrics && c2.metrics.usage_coverage,
    loadedSkillRateA: h0.behavior && h0.behavior.loaded_skill_rate,
    loadedSkillRateB: c2.behavior && c2.behavior.loaded_skill_rate,
    otherStratum: { nA: otherA.length, nB: otherB.length, meanA: mean(otherA), meanB: mean(otherB), pooledSd: pooledSd(otherA, otherB) }
  };
  const anyMet = verdicts.some(v => v.criterion === 'MET');
  const verdict = anyMet
    ? 'effect-measurable (sign per stratum verdicts)'
    : 'not-measurable-by-design -> charter clause';
  const report = { run: 'q3-variance-control-v1', frozen_rule: 'execution-plan.md#冻结的分层判定规则', generated_at: new Date().toISOString(), overall, strata: verdicts, verdict };
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  console.log('A(h0) n=' + A.length + ' mean=' + (overall.meanA == null ? 'n/a' : overall.meanA.toFixed(1)) +
    ' | B(c2) n=' + B.length + ' mean=' + (overall.meanB == null ? 'n/a' : overall.meanB.toFixed(1)) +
    ' | overall diff=' + (overall.diff == null ? 'n/a' : overall.diff.toFixed(1)) +
    ' pooledSD=' + (overall.pooledSd == null ? 'n/a' : overall.pooledSd.toFixed(1)));
  for (const v of verdicts) {
    console.log('stratum ' + v.stratum + ': nA=' + v.nA + ' nB=' + v.nB + ' meanA=' + (v.meanA == null ? '-' : v.meanA.toFixed(1)) +
      ' meanB=' + (v.meanB == null ? '-' : v.meanB.toFixed(1)) + ' diff=' + (v.diff == null ? '-' : v.diff.toFixed(1)) +
      ' pooledSD=' + (v.pooledSd == null ? '-' : v.pooledSd.toFixed(1)) + ' -> ' + v.criterion);
  }
  console.log('verdict: ' + verdict);
  console.log('result: ' + outPath);
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
