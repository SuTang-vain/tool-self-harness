'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateManifest } = require('../scripts/lib/progressive-candidate');

function validProspective() {
  return {
    schema_version: 'progressive-candidate-v1',
    candidate_id: 'c1',
    record_type: 'prospective',
    target_id: 'target',
    parent_lineage: 'h0',
    attribution: {
      failure_signature: 'missing schema assertion',
      level: 'L1',
      fitting_path: 'A-interface-constraint',
      parameter: 'P_schema'
    },
    patch: {
      surface_id: 'core-instructions',
      surface_count: 1,
      file: 'candidate/SKILL.md',
      kind: 'add-instruction',
      source_patch: 'candidate/source-patch.json'
    },
    expected_delta: {
      Q1: 'increase',
      Q2: 'non-regressive',
      Q3: 'not-preregistered',
      Q4: 'not_measured'
    },
    held_out_visibility: 'hidden-from-proposer',
    formal_repeats: 3,
    task_tree_sha256: 'abc',
    verifier_sha256: 'def',
    model_config: 'config.yaml:model',
    task_order_seed: 42,
    frozen_before_evaluation: true,
    created_at: '2026-07-30T00:00:00.000Z'
  };
}

test('accepts a complete single-surface prospective manifest', () => {
  const result = validateManifest(validProspective(), { checkFiles: false });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('rejects a multi-surface primary candidate', () => {
  const manifest = validProspective();
  manifest.patch.surface_count = 2;
  const result = validateManifest(manifest, { checkFiles: false });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /surface_count must equal 1/);
});

test('rejects held-out exposure and fewer than three repeats', () => {
  const manifest = validProspective();
  manifest.held_out_visibility = 'visible';
  manifest.formal_repeats = 2;
  const result = validateManifest(manifest, { checkFiles: false });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /hidden-from-proposer/);
  assert.match(result.errors.join('\n'), /integer >= 3/);
});

test('retrospective mapping is valid but emits a causal warning', () => {
  const manifest = validProspective();
  manifest.record_type = 'retrospective-mapping-not-preregistration';
  delete manifest.task_tree_sha256;
  delete manifest.verifier_sha256;
  delete manifest.model_config;
  delete manifest.task_order_seed;
  delete manifest.frozen_before_evaluation;
  delete manifest.created_at;
  const result = validateManifest(manifest, { checkFiles: false });
  assert.equal(result.valid, true);
  assert.match(result.warnings.join('\n'), /cannot support preregistration/);
});
