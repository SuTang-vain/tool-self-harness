#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function taskPassMap(record) {
  return Object.fromEntries((record.per_task || []).map(task => [task.split + '/' + task.task_id, {
    passes: task.passes,
    attempts: task.attempts,
    pass: task.passes === task.attempts,
    process: (task.rows || []).map(row => row.behavior || {})
  }]));
}

function mean(values) {
  return values.length ? values.reduce((a, b) => a + Number(b || 0), 0) / values.length : 0;
}

function processSummary(record) {
  const rows = (record.per_task || []).flatMap(task => task.rows || []);
  return {
    attempts: rows.length,
    loaded_skill_rate: mean(rows.map(row => Boolean(row.behavior && row.behavior.loaded_skill))),
    test_before_first_edit_rate: mean(rows.map(row => Boolean(row.behavior && row.behavior.test_before_first_edit))),
    test_after_last_edit_rate: mean(rows.map(row => Boolean(row.behavior && row.behavior.test_after_last_edit))),
    ran_tests_rate: mean(rows.map(row => Boolean(row.behavior && row.behavior.ran_tests))),
    mean_steps: mean(rows.map(row => Number(row.behavior && row.behavior.steps || 0))),
    task_errors: rows.filter(row => row.behavior && row.behavior.task_error).length
  };
}

function main() {
  const [resultDirArg, fixtureValidationArg, outputArg] = process.argv.slice(2);
  if (!resultDirArg || !fixtureValidationArg || !outputArg) {
    console.error('Usage: 17-summarize-debugging-diagnostic.js <result-dir> <fixture-validation.json> <output.json>');
    process.exit(2);
  }
  const resultDir = path.resolve(resultDirArg);
  const fixtureValidation = JSON.parse(fs.readFileSync(fixtureValidationArg, 'utf8'));
  const variants = {};
  for (const variant of ['no-skill', 'minimal', 'official-full']) {
    const file = path.join(resultDir, variant + '.json');
    if (!fs.existsSync(file)) throw new Error('missing variant result: ' + file);
    const record = JSON.parse(fs.readFileSync(file, 'utf8'));
    variants[variant] = {
      result_path: file,
      held_in: record.held_in,
      held_out: record.held_out,
      process: processSummary(record),
      metrics: record.metrics,
      task_passes: taskPassMap(record)
    };
  }
  const names = Object.keys(variants);
  const allKeys = Object.keys(variants['no-skill'].task_passes).sort();
  const taskVectorsDiffer = allKeys.some(key => new Set(names.map(name => variants[name].task_passes[key].pass)).size > 1);
  const processKeys = ['test_before_first_edit_rate', 'test_after_last_edit_rate', 'ran_tests_rate', 'mean_steps'];
  const processDiffs = Object.fromEntries(processKeys.map(key => [key, {
    no_skill: variants['no-skill'].process[key],
    minimal: variants.minimal.process[key],
    official_full: variants['official-full'].process[key],
    range: Math.max(...names.map(name => variants[name].process[key])) - Math.min(...names.map(name => variants[name].process[key]))
  }]));
  const processVectorsDiffer = Object.values(processDiffs).some(value => value.range > 0);
  const minimalHeadroom = variants.minimal.held_in.passes < variants.minimal.held_in.attempts;
  const officialExposure = variants['official-full'].process.loaded_skill_rate > 0;
  const intendedMovement = taskVectorsDiffer || processDiffs.test_before_first_edit_rate.range > 0 || processDiffs.test_after_last_edit_rate.range > 0;
  const floorSaturated = names.every(name => variants[name].held_in.passes === 0) && names.every(name => variants[name].held_out.passes === 0);
  const ceilingSaturated = names.every(name => variants[name].held_in.passes === variants[name].held_in.attempts) && names.every(name => variants[name].held_out.passes === variants[name].held_out.attempts);
  const gates = {
    gate_0: { decision: fixtureValidation.all_untouched_fail && fixtureValidation.all_references_pass ? 'pass' : 'fail' },
    genuine_variant_separation: { decision: taskVectorsDiffer || processVectorsDiffer ? 'pass' : 'fail', task_vectors_differ: taskVectorsDiffer, process_vectors_differ: processVectorsDiffer },
    minimal_headroom: { decision: minimalHeadroom ? 'pass' : 'fail', observed: variants.minimal.held_in.passes + '/' + variants.minimal.held_in.attempts },
    official_full_exposure: { decision: officialExposure ? 'pass' : 'fail', loaded_skill_rate: variants['official-full'].process.loaded_skill_rate },
    intended_process_or_task_movement: { decision: intendedMovement ? 'pass' : 'fail' },
    saturation: { decision: !floorSaturated && !ceilingSaturated ? 'pass' : 'fail', floor_saturated: floorSaturated, ceiling_saturated: ceilingSaturated }
  };
  const go = Object.values(gates).every(gate => gate.decision === 'pass');
  const report = {
    experiment: path.basename(resultDir),
    stage: 'diagnostic-qualification',
    repeats: 1,
    q2: 'not-established-by-diagnostic',
    q4: 'not_measured',
    variants,
    process_differences: processDiffs,
    per_task: allKeys.map(key => ({ task: key, ...Object.fromEntries(names.map(name => [name, variants[name].task_passes[key].pass])) })),
    gates,
    decision: go ? 'go-formal-baseline' : 'stop-redesign',
    interpretation_boundary: 'One-repeat diagnostic results qualify or reject the benchmark only; they are not per-task reliability or Self-Harness evolution evidence.',
    generated_at: new Date().toISOString()
  };
  fs.mkdirSync(path.dirname(path.resolve(outputArg)), { recursive: true });
  fs.writeFileSync(outputArg, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({
    variants: Object.fromEntries(names.map(name => [name, {
      held_in: variants[name].held_in.passes + '/' + variants[name].held_in.attempts,
      held_out: variants[name].held_out.passes + '/' + variants[name].held_out.attempts,
      process: variants[name].process
    }])),
    gates,
    decision: report.decision
  }, null, 2));
}

main();
