'use strict';

/**
 * Pure helpers for per-task, per-repeat acceptance decisions.
 *
 * A repeat record has the shape returned by runSplit:
 *   { p_in, p_ho, details: [{ split, results: [{ task_id, verify: { status } }] }] }
 */

function splitResults(record, split) {
  const section = (record && Array.isArray(record.details))
    ? record.details.find(d => d && d.split === split)
    : null;
  return section && Array.isArray(section.results) ? section.results : [];
}

function passedTaskIds(record, split) {
  return new Set(
    splitResults(record, split)
      .filter(r => r && r.task_id && r.verify && r.verify.status === 'pass')
      .map(r => r.task_id)
  );
}

function allTaskIds(repeats, split) {
  const ids = new Set();
  for (const repeat of repeats || []) {
    for (const result of splitResults(repeat, split)) {
      if (result && result.task_id) ids.add(result.task_id);
    }
  }
  return ids;
}

function stableTaskIds(repeats, split) {
  const reps = Array.isArray(repeats) ? repeats : [];
  if (reps.length === 0) return [];
  const ids = allTaskIds(reps, split);
  return [...ids].filter(taskId => reps.every(repeat => passedTaskIds(repeat, split).has(taskId))).sort();
}

function bestTaskIds(repeats, split) {
  const passed = new Set();
  for (const repeat of repeats || []) {
    for (const taskId of passedTaskIds(repeat, split)) passed.add(taskId);
  }
  return [...passed].sort();
}

function summarizeRepeat(repeat, index) {
  return {
    repeat: index,
    p_in: repeat.p_in,
    p_ho: repeat.p_ho,
    passed_in_tasks: [...passedTaskIds(repeat, 'held-in')].sort(),
    passed_ho_tasks: [...passedTaskIds(repeat, 'held-out')].sort()
  };
}

function summarizeRepeats(repeats) {
  return (repeats || []).map(summarizeRepeat);
}

function taskSet(value) {
  return new Set(Array.isArray(value) ? value : []);
}

function hasTaskMetadata(record) {
  return Boolean(
    record &&
    record.best_pass_tasks &&
    Array.isArray(record.best_pass_tasks['held-in']) &&
    Array.isArray(record.best_pass_tasks['held-out']) &&
    record.stable_pass_tasks &&
    Array.isArray(record.stable_pass_tasks['held-in']) &&
    Array.isArray(record.stable_pass_tasks['held-out'])
  );
}

/**
 * Return tasks which are a new best-of-repeat pass for the candidate but are
 * not stable across all repeats. Only tasks that were not already a best-pass
 * in the baseline count as improvements.
 */
function unstableNewTasks(baseline, candidate, split) {
  const baselineBest = taskSet(baseline && baseline.best_pass_tasks && baseline.best_pass_tasks[split]);
  const candidateBest = taskSet(candidate && candidate.best_pass_tasks && candidate.best_pass_tasks[split]);
  const candidateStable = taskSet(candidate && candidate.stable_pass_tasks && candidate.stable_pass_tasks[split]);
  return [...candidateBest]
    .filter(taskId => !baselineBest.has(taskId) && !candidateStable.has(taskId))
    .sort();
}

/**
 * Apply the split-wise pass-rate gate plus per-task stability.
 *
 * A split can improve only through tasks that are stable-pass in all repeats.
 * This is deliberately stricter than the historical best-of-N gate.
 */
function evaluateCandidate(baseline, candidate) {
  const improvesIn = candidate.p_in > baseline.p_in;
  const improvesHo = candidate.p_ho > baseline.p_ho;
  const degradesIn = candidate.p_in < baseline.p_in;
  const degradesHo = candidate.p_ho < baseline.p_ho;
  const passRateAccept = (improvesIn && !degradesHo) || (improvesHo && !degradesIn);

  // Check both splits. Even when a split's aggregate count is flat, a task
  // that newly passes there must still be stable under the per-task contract.
  const unstableIn = unstableNewTasks(baseline, candidate, 'held-in');
  const unstableHo = unstableNewTasks(baseline, candidate, 'held-out');
  const unstable = [...new Set([...unstableIn, ...unstableHo])].sort();
  const perTaskAccept = passRateAccept && unstable.length === 0;

  let reason;
  if (!passRateAccept) {
    reason = (degradesIn || degradesHo) ? 'degrades a split' : 'no improvement (trade-off or flat)';
  } else if (!perTaskAccept) {
    const splitParts = [];
    if (unstableIn.length) splitParts.push('held-in: ' + unstableIn.join(','));
    if (unstableHo.length) splitParts.push('held-out: ' + unstableHo.join(','));
    reason = 'unstable improvement: ' + splitParts.join('; ') +
      ' pass in best-of-repeats but not in all repeats';
  } else {
    reason = improvesIn && improvesHo
      ? 'improves both splits with stable per-task passes'
      : 'improves one split without degrading the other with stable per-task passes';
  }

  return {
    improves_in: improvesIn,
    improves_ho: improvesHo,
    degrades_in: degradesIn,
    degrades_ho: degradesHo,
    pass_rate_accept: passRateAccept,
    per_task_accept: perTaskAccept,
    unstable_in: unstableIn,
    unstable_ho: unstableHo,
    unstable_tasks: unstable,
    decision: perTaskAccept ? 'accept' : 'reject',
    reason
  };
}

module.exports = {
  splitResults,
  hasTaskMetadata,
  passedTaskIds,
  stableTaskIds,
  bestTaskIds,
  summarizeRepeat,
  summarizeRepeats,
  unstableNewTasks,
  evaluateCandidate
};
