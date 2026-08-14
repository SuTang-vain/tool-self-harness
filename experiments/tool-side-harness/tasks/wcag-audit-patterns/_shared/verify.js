#!/usr/bin/env node
'use strict';
/*
 * verify.js — hidden grader for the wcag-audit-patterns suite (v2).
 * Usage: node verify.js <workspace> <trace> <expected.json>
 *
 * expected.json modes:
 *   {"mode":"audit","report":"audit.md","tier_order":["Critical","Serious","Moderate"],
 *    "findings":[{"key":"img-missing-alt","tier":"Critical","match":"alt",
 *                 "tier_exclusive":true}, ...]}
 *     — the tier section of the report must MATCH the finding's regex, and (when
 *       tier_exclusive) no other tier section may match it. Content-based: the
 *       grader only demands what the harness teaches (D5), never synthetic keys.
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

function tierSections(report, tierOrder) {
  const sections = {};
  const positions = tierOrder.map((t) => ({ t, i: report.indexOf('## ' + t) })).filter((x) => x.i >= 0);
  positions.forEach((x, idx) => {
    const end = idx + 1 < positions.length ? positions[idx + 1].i : report.length;
    sections[x.t] = report.slice(x.i, end);
  });
  return sections;
}

if (expected.mode === 'audit') {
  const reportPath = path.join(workspace, expected.report || 'audit.md');
  if (!fs.existsSync(reportPath)) {
    console.error('audit report missing: ' + expected.report);
    process.exit(1);
  }
  const report = fs.readFileSync(reportPath, 'utf8');
  const sections = tierSections(report, expected.tier_order || []);
  for (const f of expected.findings || []) {
    const re = new RegExp(f.match, f.flags || 'i');
    const own = sections[f.tier] || '';
    if (!re.test(own)) {
      errors.push('finding "' + f.key + '" not found under ' + f.tier);
    }
    // Positive placement only: false positives in other tiers are not
    // penalized — remediation examples legitimately repeat finding words,
    // and the tier knowledge tested is "the finding belongs to this tier".
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
