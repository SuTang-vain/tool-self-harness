#!/usr/bin/env node
'use strict';
/*
 * verify.js — hidden grader for the wcag-audit-patterns suite.
 * Usage: node verify.js <workspace> <trace> <expected.json>
 *
 * expected.json modes:
 *   {"mode":"audit","report":"audit.md","tier_order":["Critical","Serious","Moderate"],
 *    "findings":[{"key":"img-missing-alt","tier":"Critical"}, ...]}
 *     — every finding key must appear inside its tier's section of the report.
 *   {"mode":"fix","page":"page.html","violations_must_be_absent":["input-missing-label",...]}
 *     — none of the listed violations may remain in the fixed page.
 */
const fs = require('fs');
const path = require('path');
const { violations } = require('./a11y-rules.js');

const [workspaceArg, , expectedArg] = process.argv.slice(2);
if (!workspaceArg || !expectedArg) { console.error('usage: verify.js <workspace> <trace> <expected.json>'); process.exit(2); }
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const errors = [];

if (expected.mode === 'audit') {
  const reportPath = path.join(workspace, expected.report || 'audit.md');
  if (!fs.existsSync(reportPath)) {
    console.error('audit report missing: ' + expected.report);
    process.exit(1);
  }
  const report = fs.readFileSync(reportPath, 'utf8');
  const tierPositions = {};
  let prev = null;
  for (const tier of expected.tier_order || []) {
    const idx = report.indexOf('## ' + tier);
    tierPositions[tier] = idx;
  }
  for (const f of expected.findings || []) {
    const keyIdx = report.indexOf(f.key);
    if (keyIdx < 0) { errors.push('finding missing: ' + f.key); continue; }
    const t = tierPositions[f.tier];
    if (t < 0) { errors.push('tier section missing: ' + f.tier); continue; }
    const next = (expected.tier_order.slice(expected.tier_order.indexOf(f.tier) + 1))
      .map(t2 => tierPositions[t2]).filter(i => i >= 0).sort((a, b) => a - b)[0];
    if (keyIdx < t || (next !== undefined && keyIdx > next)) {
      errors.push('finding ' + f.key + ' is not classified under ' + f.tier);
    }
  }
} else if (expected.mode === 'fix') {
  const pagePath = path.join(workspace, expected.page || 'page.html');
  if (!fs.existsSync(pagePath)) {
    console.error('page missing: ' + expected.page);
    process.exit(1);
  }
  const found = violations(fs.readFileSync(pagePath, 'utf8'));
  for (const v of expected.violations_must_be_absent || []) {
    if (found.includes(v)) errors.push('violation remains: ' + v);
  }
} else {
  errors.push('unknown mode: ' + expected.mode);
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('wcag verifier passed');
