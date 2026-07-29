'use strict';

const POLICY_VERSION = 'reliable-task-set-v1';

function set(values) { return new Set(values || []); }
function difference(a, b) { return [...a].filter(x => !b.has(x)).sort(); }

function reliableTaskSet(record, split) {
  const section = split === 'held-in' ? record.held_in : record.held_out;
  return set(section && section.stable_tasks);
}

function evaluate(baseline, candidate) {
  const improvesIn = candidate.held_in.passes > baseline.held_in.passes;
  const improvesHo = candidate.held_out.passes > baseline.held_out.passes;
  const degradesIn = candidate.held_in.passes < baseline.held_in.passes;
  const degradesHo = candidate.held_out.passes < baseline.held_out.passes;
  const paperAccept = (improvesIn && !degradesHo) || (improvesHo && !degradesIn);

  const baseIn = reliableTaskSet(baseline, 'held-in');
  const baseHo = reliableTaskSet(baseline, 'held-out');
  const candIn = reliableTaskSet(candidate, 'held-in');
  const candHo = reliableTaskSet(candidate, 'held-out');
  const gainedIn = difference(candIn, baseIn);
  const gainedHo = difference(candHo, baseHo);
  const lostIn = difference(baseIn, candIn);
  const lostHo = difference(baseHo, candHo);
  const reliableImproves = gainedIn.length + gainedHo.length > 0;
  const reliableRegresses = lostIn.length + lostHo.length > 0;
  const reliableAccept = reliableImproves && !reliableRegresses && !degradesIn && !degradesHo;

  return {
    policy_version: POLICY_VERSION,
    paper_gate: {
      decision: paperAccept ? 'accept' : 'reject',
      improves_in: improvesIn,
      improves_ho: improvesHo,
      degrades_in: degradesIn,
      degrades_ho: degradesHo,
      baseline: { held_in: baseline.held_in.passes, held_out: baseline.held_out.passes },
      candidate: { held_in: candidate.held_in.passes, held_out: candidate.held_out.passes }
    },
    reliable_gate: {
      decision: reliableAccept ? 'accept' : 'reject',
      gained_in: gainedIn,
      gained_ho: gainedHo,
      lost_in: lostIn,
      lost_ho: lostHo,
      mean_degrades_in: degradesIn,
      mean_degrades_ho: degradesHo,
      baseline: { held_in: [...baseIn].sort(), held_out: [...baseHo].sort() },
      candidate: { held_in: [...candIn].sort(), held_out: [...candHo].sort() }
    },
    // Backward-compatible alias for Round-0 reports.
    stable_gate: {
      decision: reliableAccept ? 'accept' : 'reject',
      gained_in: gainedIn,
      gained_ho: gainedHo,
      lost_in: lostIn,
      lost_ho: lostHo,
      mean_degrades_in: degradesIn,
      mean_degrades_ho: degradesHo,
      baseline: { held_in: [...baseIn].sort(), held_out: [...baseHo].sort() },
      candidate: { held_in: [...candIn].sort(), held_out: [...candHo].sort() }
    },
    promote: reliableAccept
  };
}

function attemptMap(record) {
  const out = new Map();
  for (const task of record.per_task || []) {
    for (const row of task.rows || []) {
      out.set([row.split, row.task_id, row.repeat].join('/'), Boolean(row.pass));
    }
  }
  return out;
}

function binomialCoefficient(n, k) {
  k = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - k + i) / i;
  return value;
}

function exactTwoSidedSignP(wins, losses) {
  const n = wins + losses;
  if (n === 0) return 1;
  const tail = Math.min(wins, losses);
  let cumulative = 0;
  for (let k = 0; k <= tail; k++) cumulative += binomialCoefficient(n, k) * Math.pow(0.5, n);
  return Math.min(1, 2 * cumulative);
}

function pairedAttemptSummary(baseline, candidate) {
  const base = attemptMap(baseline);
  const cand = attemptMap(candidate);
  let bothPass = 0, bothFail = 0, candidateWins = 0, baselineWins = 0;
  const discordant = [];
  for (const [key, basePass] of base) {
    if (!cand.has(key)) throw new Error('candidate missing paired attempt: ' + key);
    const candPass = cand.get(key);
    if (basePass && candPass) bothPass++;
    else if (!basePass && !candPass) bothFail++;
    else if (!basePass && candPass) { candidateWins++; discordant.push({ key, winner: 'candidate' }); }
    else { baselineWins++; discordant.push({ key, winner: 'baseline' }); }
  }
  return {
    paired_attempts: base.size,
    both_pass: bothPass,
    both_fail: bothFail,
    candidate_wins: candidateWins,
    baseline_wins: baselineWins,
    discordant_count: candidateWins + baselineWins,
    exact_two_sided_sign_p: exactTwoSidedSignP(candidateWins, baselineWins),
    discordant
  };
}

module.exports = { POLICY_VERSION, evaluate, pairedAttemptSummary, exactTwoSidedSignP };
