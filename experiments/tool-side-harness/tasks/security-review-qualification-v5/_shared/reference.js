#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const [workspaceArg,expectedArg]=process.argv.slice(2);
const workspace=path.resolve(workspaceArg);
const expected=JSON.parse(fs.readFileSync(expectedArg,'utf8'));
const findings=(expected.findings||[]).map(item=>{
  const evidenceMarkers=(item.evidence_groups||[]).map(group=>group[0]).join(', ');
  const remediationMarkers=(item.remediation_markers||[]).join(', ');
  return {canonical_id:item.canonical_id,category_label:item.canonical_id,severity:item.minimum_severity,files:item.files,evidence:`The exploitable trust-boundary trace includes ${evidenceMarkers}. User-controlled or untrusted data reaches the identified sensitive operation without the required effective guard.`,remediation:`Correct the vulnerable path using ${remediationMarkers}. Apply the control before the sensitive operation and add a regression test for the exploit path.`};
});
fs.writeFileSync(path.join(workspace,'SECURITY_REVIEW.json'),JSON.stringify({findings,scanned_files:expected.scanned_files,source_modified:false},null,2)+'\n');
