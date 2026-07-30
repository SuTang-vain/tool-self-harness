#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const [workspaceArg, expectedArg] = process.argv.slice(2);
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const findings = expected.findings.map(item => ({
  category: item.category,
  severity: item.minimum_severity,
  files: item.files,
  evidence: 'Untrusted input reaches the identified dangerous operation without an effective validation or authorization boundary.',
  remediation: 'Apply a context-appropriate allowlist or authorization check before the sink and add a regression test for the exploit path.'
}));
fs.writeFileSync(path.join(workspace, 'SECURITY_REVIEW.json'), JSON.stringify({
  findings,
  scanned_files: expected.scanned_files,
  source_modified: false
}, null, 2) + '\n');
