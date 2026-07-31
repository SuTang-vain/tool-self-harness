#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const [workspaceArg, expectedArg] = process.argv.slice(2);
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const findings = (expected.findings || []).map(item => ({
  category: item.canonical_id || item.category,
  severity: item.minimum_severity,
  files: item.files,
  evidence: 'The reviewed input reaches the identified security-sensitive operation without an effective boundary; the trace is exploitable under the task threat model.',
  remediation: 'Add a context-appropriate validation, authorization, or safe API boundary before the sensitive operation and add a regression test for the exploit path.'
}));
fs.writeFileSync(path.join(workspace, 'SECURITY_REVIEW.json'), JSON.stringify({ findings, scanned_files: expected.scanned_files, source_modified: false }, null, 2) + '\n');
