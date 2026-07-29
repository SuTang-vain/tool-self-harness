'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const acceptance = require('../scripts/lib/acceptance');

function result(task_id, status) {
  return { task_id, verify: { status } };
}

function repeat(inPass, hoPass) {
  return {
    p_in: inPass.length,
    p_ho: hoPass.length,
    details: [
      {
        split: 'held-in',
        results: ['t01', 't02', 't03'].map(id => result(id, inPass.includes(id) ? 'pass' : 'fail'))
      },
      {
        split: 'held-out',
        results: ['t04', 't05'].map(id => result(id, hoPass.includes(id) ? 'pass' : 'fail'))
      }
    ]
  };
}

function aggregate(repeats) {
  return {
    p_in: Math.max(...repeats.map(r => r.p_in)),
    p_ho: Math.max(...repeats.map(r => r.p_ho)),
    stable_pass_tasks: {
      'held-in': acceptance.stableTaskIds(repeats, 'held-in'),
      'held-out': acceptance.stableTaskIds(repeats, 'held-out')
    },
    best_pass_tasks: {
      'held-in': acceptance.bestTaskIds(repeats, 'held-in'),
      'held-out': acceptance.bestTaskIds(repeats, 'held-out')
    }
  };
}

test('legacy aggregate records are missing required task metadata', () => {
  assert.equal(acceptance.hasTaskMetadata({ p_in: 2, p_ho: 1 }), false);
  assert.equal(acceptance.hasTaskMetadata({
    best_pass_tasks: { 'held-in': [], 'held-out': [] },
    stable_pass_tasks: { 'held-in': [], 'held-out': [] }
  }), true);
});

test('stable task ids require a pass in every repeat', () => {
  const repeats = [
    repeat(['t01', 't02'], ['t04']),
    repeat(['t01'], ['t04', 't05'])
  ];
  assert.deepEqual(acceptance.stableTaskIds(repeats, 'held-in'), ['t01']);
  assert.deepEqual(acceptance.stableTaskIds(repeats, 'held-out'), ['t04']);
  assert.deepEqual(acceptance.bestTaskIds(repeats, 'held-in'), ['t01', 't02']);
  assert.deepEqual(acceptance.bestTaskIds(repeats, 'held-out'), ['t04', 't05']);
});

test('rejects an unstable held-in improvement', () => {
  const baseline = aggregate([
    repeat(['t01', 't03'], ['t04']),
    repeat(['t01', 't03'], ['t04'])
  ]);
  const candidate = aggregate([
    repeat(['t01', 't02', 't03'], ['t04']),
    repeat(['t01', 't03'], ['t04'])
  ]);
  const decision = acceptance.evaluateCandidate(baseline, candidate);
  assert.equal(decision.pass_rate_accept, true);
  assert.equal(decision.per_task_accept, false);
  assert.deepEqual(decision.unstable_in, ['t02']);
  assert.match(decision.reason, /held-in: t02/);
});

test('rejects an unstable held-out improvement', () => {
  const baseline = aggregate([
    repeat(['t01', 't03'], ['t04']),
    repeat(['t01', 't03'], ['t04'])
  ]);
  const candidate = aggregate([
    repeat(['t01', 't03'], ['t04', 't05']),
    repeat(['t01', 't03'], ['t04'])
  ]);
  const decision = acceptance.evaluateCandidate(baseline, candidate);
  assert.equal(decision.pass_rate_accept, true);
  assert.equal(decision.per_task_accept, false);
  assert.deepEqual(decision.unstable_ho, ['t05']);
});

test('accepts a stable improvement without held-out regression', () => {
  const baseline = aggregate([
    repeat(['t01', 't03'], ['t04']),
    repeat(['t01', 't03'], ['t04'])
  ]);
  const candidate = aggregate([
    repeat(['t01', 't02', 't03'], ['t04']),
    repeat(['t01', 't02', 't03'], ['t04'])
  ]);
  const decision = acceptance.evaluateCandidate(baseline, candidate);
  assert.equal(decision.pass_rate_accept, true);
  assert.equal(decision.per_task_accept, true);
  assert.deepEqual(decision.unstable_tasks, []);
  assert.equal(decision.decision, 'accept');
});
