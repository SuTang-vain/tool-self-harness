'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate, exactTwoSidedSignP } = require('../scripts/lib/generic-acceptance');

function record(inPasses, outPasses, stableIn, stableOut) {
  return {
    held_in: { passes: inPasses, stable_tasks: stableIn },
    held_out: { passes: outPasses, stable_tasks: stableOut }
  };
}

test('paper gate can accept a reliable task exchange while promotion rejects it', () => {
  const baseline = record(14, 4, ['a', 'b'], ['x']);
  const candidate = record(15, 4, ['a', 'c'], ['x']);
  const result = evaluate(baseline, candidate);
  assert.equal(result.paper_gate.decision, 'accept');
  assert.equal(result.reliable_gate.decision, 'reject');
  assert.deepEqual(result.reliable_gate.gained_in, ['c']);
  assert.deepEqual(result.reliable_gate.lost_in, ['b']);
});

test('reliable gate accepts gain without any task or mean regression', () => {
  const result = evaluate(
    record(20, 6, ['a'], ['x']),
    record(21, 6, ['a', 'b'], ['x'])
  );
  assert.equal(result.paper_gate.decision, 'accept');
  assert.equal(result.reliable_gate.decision, 'accept');
  assert.equal(result.promote, true);
});

test('two-sided exact sign test is conservative for three wins and one loss', () => {
  assert.equal(exactTwoSidedSignP(3, 1), 0.625);
});
