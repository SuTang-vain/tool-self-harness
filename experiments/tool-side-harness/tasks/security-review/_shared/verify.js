#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const [workspaceArg, expectedArg] = process.argv.slice(2);
if (!workspaceArg || !expectedArg) process.exit(2);
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const reportPath = path.join(workspace, 'SECURITY_REVIEW.json');
const errors = [];
if (!fs.existsSync(reportPath)) {
  console.error('SECURITY_REVIEW.json missing');
  process.exit(1);
}
let report;
try { report = JSON.parse(fs.readFileSync(reportPath, 'utf8')); }
catch (error) { console.error('invalid report JSON: ' + error.message); process.exit(1); }
if (!Array.isArray(report.findings)) errors.push('findings must be an array');
if (!Array.isArray(report.scanned_files)) errors.push('scanned_files must be an array');
const normalize = value => String(value || '').toLowerCase().trim().replace(/[\s_/]+/g, '-');
const findings = Array.isArray(report.findings) ? report.findings : [];
const actualCategories = findings.map(f => normalize(f.category)).sort();
const expectedCategories = expected.findings.map(f => normalize(f.category)).sort();
if (JSON.stringify(actualCategories) !== JSON.stringify(expectedCategories)) {
  errors.push('finding categories mismatch: expected ' + expectedCategories.join(',') + ' got ' + actualCategories.join(','));
}
const severityRank = {INFO:0, LOW:1, MEDIUM:2, HIGH:3, CRITICAL:4};
for (const wanted of expected.findings) {
  const finding = findings.find(f => normalize(f.category) === normalize(wanted.category));
  if (!finding) continue;
  const severity = String(finding.severity || '').toUpperCase();
  if (!(severity in severityRank) || severityRank[severity] < severityRank[wanted.minimum_severity]) {
    errors.push(wanted.category + ' severity below ' + wanted.minimum_severity);
  }
  const files = Array.isArray(finding.files) ? finding.files.map(String) : [String(finding.file || '')];
  for (const required of wanted.files) if (!files.some(file => file.includes(required))) errors.push(wanted.category + ' missing file ' + required);
  if (String(finding.evidence || '').trim().length < 20) errors.push(wanted.category + ' lacks concrete evidence');
  if (String(finding.remediation || '').trim().length < 20) errors.push(wanted.category + ' lacks remediation');
}
for (const required of expected.scanned_files) {
  if (!Array.isArray(report.scanned_files) || !report.scanned_files.some(file => String(file).includes(required))) {
    errors.push('scanned_files missing ' + required);
  }
}
const status = spawnSync('git', ['status', '--porcelain'], { cwd: workspace, encoding: 'utf8' });
for (const line of status.stdout.split('\n').filter(Boolean)) {
  const changed = line.slice(3).trim();
  if (changed !== 'SECURITY_REVIEW.json') errors.push('audited source was modified: ' + changed);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('security review verifier passed');
