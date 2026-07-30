'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 'progressive-candidate-v1';
const LEVELS = new Set(['L0', 'L1', 'L2']);
const PATHS = new Set([
  'A-interface-constraint',
  'B-state-recovery',
  'C-density-pruning',
  'D-progressive-exposure'
]);
const PARAMETERS = new Set(['P_schema', 'P_order', 'P_density', 'P_prune']);
const RECORD_TYPES = new Set(['prospective', 'retrospective-mapping-not-preregistration']);

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function requireString(value, label, errors) {
  if (!nonEmpty(value)) errors.push(label + ' must be a non-empty string');
}

function resolveRepoFile(repoRoot, file) {
  if (!nonEmpty(file)) return null;
  return path.isAbsolute(file) ? file : path.resolve(repoRoot, file);
}

function validateManifest(manifest, options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const checkFiles = options.checkFiles !== false;
  const errors = [];
  const warnings = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { valid: false, errors: ['manifest must be a JSON object'], warnings };
  }

  if (manifest.schema_version !== SCHEMA_VERSION) {
    errors.push(`schema_version must be ${SCHEMA_VERSION}`);
  }
  if (!RECORD_TYPES.has(manifest.record_type)) {
    errors.push('record_type must be prospective or retrospective-mapping-not-preregistration');
  }
  for (const field of ['candidate_id', 'target_id', 'parent_lineage']) {
    requireString(manifest[field], field, errors);
  }

  const attribution = manifest.attribution || {};
  requireString(attribution.failure_signature, 'attribution.failure_signature', errors);
  if (!LEVELS.has(attribution.level)) {
    errors.push('attribution.level must be one of L0, L1, L2');
  }
  if (!PATHS.has(attribution.fitting_path)) {
    errors.push('attribution.fitting_path must be a registered fitting path');
  }
  if (!PARAMETERS.has(attribution.parameter)) {
    errors.push('attribution.parameter must be a registered 4D-model parameter');
  }

  const patch = manifest.patch || {};
  requireString(patch.surface_id, 'patch.surface_id', errors);
  if (patch.surface_count !== 1) {
    errors.push('patch.surface_count must equal 1 for the primary progressive protocol');
  }
  requireString(patch.file, 'patch.file', errors);
  requireString(patch.kind, 'patch.kind', errors);
  requireString(patch.source_patch, 'patch.source_patch', errors);

  const expected = manifest.expected_delta || {};
  for (const dimension of ['Q1', 'Q2', 'Q3', 'Q4']) {
    if (!(dimension in expected)) errors.push(`expected_delta.${dimension} is required`);
  }
  if (manifest.held_out_visibility !== 'hidden-from-proposer') {
    errors.push('held_out_visibility must be hidden-from-proposer');
  }
  if (!Number.isInteger(manifest.formal_repeats) || manifest.formal_repeats < 3) {
    errors.push('formal_repeats must be an integer >= 3');
  }

  if (manifest.record_type === 'prospective') {
    for (const field of ['task_tree_sha256', 'verifier_sha256', 'model_config', 'task_order_seed']) {
      if (manifest[field] === undefined || manifest[field] === null || manifest[field] === '') {
        errors.push(`${field} is required for a prospective record`);
      }
    }
    if (manifest.frozen_before_evaluation !== true) {
      errors.push('frozen_before_evaluation must be true for a prospective record');
    }
    if (!nonEmpty(manifest.created_at)) errors.push('created_at is required for a prospective record');
  } else if (manifest.record_type === 'retrospective-mapping-not-preregistration') {
    warnings.push('retrospective mapping cannot support preregistration or prospective causal claims');
  }

  if (checkFiles && nonEmpty(patch.file)) {
    const candidateFile = resolveRepoFile(repoRoot, patch.file);
    if (!fs.existsSync(candidateFile)) errors.push('patch.file does not exist: ' + patch.file);
  }
  if (checkFiles && nonEmpty(patch.source_patch)) {
    const sourcePatchFile = resolveRepoFile(repoRoot, patch.source_patch);
    if (!fs.existsSync(sourcePatchFile)) {
      errors.push('patch.source_patch does not exist: ' + patch.source_patch);
    } else {
      try {
        const sourcePatch = JSON.parse(fs.readFileSync(sourcePatchFile, 'utf8'));
        if (sourcePatch.surface_id !== patch.surface_id) {
          errors.push('source patch surface_id does not match manifest patch.surface_id');
        }
      } catch (error) {
        errors.push('patch.source_patch is not valid JSON: ' + error.message);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = {
  SCHEMA_VERSION,
  validateManifest
};
