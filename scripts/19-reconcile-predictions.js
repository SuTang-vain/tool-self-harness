#!/usr/bin/env node
'use strict';
/*
 * 19-reconcile-predictions.js — reconcile frozen screening predictions with
 * measured effect sizes for the ts-mcp suite (S1).
 *
 * Usage: node scripts/19-reconcile-predictions.js
 *   <screening.json> <predictions.json> <full.json> <minimal.json> <none.json> <out.json>
 *
 * Emits per-task: measured E = full_pass_rate - none_pass_rate, the frozen
 * prediction, and an in-range verdict; plus the aggregate discrimination
 * verdict per the pilot stop rules.
 */
const fs = require('fs');

const [screeningArg, predictionsArg, fullArg, minimalArg, noneArg, outArg] = process.argv.slice(2);
if (!screeningArg || !fullArg || !minimalArg || !noneArg || !outArg) {
  console.error('usage: 19-reconcile-predictions.js <screening.json> <predictions.json> <full.json> <minimal.json> <none.json> <out.json>');
  process.exit(2);
}
const screening = JSON.parse(fs.readFileSync(screeningArg, 'utf8'));
const predictions = JSON.parse(fs.readFileSync(predictionsArg, 'utf8'));
const load = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const full = load(fullArg), minimal = load(minimalArg), none = load(noneArg);

function perTask(data) {
  const out = {};
  for (const t of data.per_task || []) out[t.task_id] = { split: t.split, passes: t.passes, attempts: t.attempts };
  return out;
}
const F = perTask(full), M = perTask(minimal), N = perTask(none);

const rows = [];
for (const t of Object.keys(F)) {
  const E = (F[t].passes - N[t].passes) / 3;
  rows.push({
    task: t, split: F[t].split,
    full: F[t].passes + '/3', minimal: M[t] ? M[t].passes + '/3' : null, none: N[t] ? N[t].passes + '/3' : null,
    measured_E: E
  });
}

// prediction mapping from the preregistration (frozen, per model)
const modelArg = process.argv[8] || 'glm';
const inRange = (lo, hi) => (E) => E >= lo - 1e-9 && E <= hi + 1e-9;
const predMaps = {
  glm: {
    'ts-01-fix-transport': { source: 'tasks_on_http_class', check: (E) => E >= 0.5, text: 'E >= 0.5 (both models)' },
    'ts-02-fix-package': { source: 'tasks_on_package_split', check: inRange(0.33, 0.67), text: 'E ~ 0.33-0.67 (GLM)' },
    'ts-03-fix-removed': { source: 'tasks_on_removed_transports', check: (E) => E >= 0.5, text: 'E >= 0.5 (GLM)' },
    'ts-04-fix-errors': { source: 'preregistered_hypothesis', check: (E) => E >= 0.5, text: 'E >= 0.5 (resistance hypothesis, unscreeened)' }
  },
  deepseek: {
    'ts-01-fix-transport': { source: 'tasks_on_http_class', check: (E) => E >= 0.5, text: 'E >= 0.5 (both models)' },
    'ts-02-fix-package': { source: 'tasks_on_package_split', check: (E) => E >= 0.5, text: 'E >= 0.5 (DeepSeek)' },
    'ts-03-fix-removed': { source: 'tasks_on_removed_transports', check: inRange(0.33, 0.67), text: 'E ~ 0.33-0.67 (DeepSeek)' },
    'ts-04-fix-errors': { source: 'preregistered_hypothesis', check: (E) => E >= 0.5, text: 'E >= 0.5 (resistance hypothesis, unscreeened)' }
  }
};
const predMap = predMaps[modelArg] || predMaps.glm;
for (const r of rows) {
  const p = predMap[r.task];
  r.prediction = p ? p.text : 'none frozen';
  r.verdict = p ? (p.check(r.measured_E) ? 'in-range' : 'out-of-range') : 'n/a';
}

// aggregate discrimination per stop rules
const agg = (d, k) => ({ in: (d.held_in || {}).passes, out: (d.held_out || {}).passes });
const agF = agg(full), agM = agg(minimal), agN = agg(none);
const contrast = (a, b) => a.in !== b.in || a.out !== b.out;
const verdict = {
  held_in_moves: contrast(agF, agM) || contrast(agF, agN),
  held_out_moves: contrast(agF, agM) || contrast(agF, agN),
  saturated_tasks: rows.filter((r) => [r.full, r.minimal, r.none].every((x) => x === '3/3') || [r.full, r.minimal, r.none].every((x) => x === '0/3')).map((r) => r.task),
  note: 'judged against the frozen preregistration stop rules'
};

const out = {
  screening: screening.verdict,
  recorded_at: new Date().toISOString(),
  rows,
  aggregate: { full: agF, minimal: agM, none: agN },
  discrimination_verdict: verdict,
  predictions_frozen: predictions.preregistered_predictions
};
fs.writeFileSync(outArg, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
