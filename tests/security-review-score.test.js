'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {scoreReport}=require('../experiments/tool-side-harness/tasks/security-review-qualification-v3/_shared/score');
const expected={
  findings:[{canonical_id:'broken-object-level-authorization',aliases:['idor'],minimum_severity:'HIGH',files:['src/a.js','src/b.js'],evidence_groups:[['tenant','owner'],['findbyid','find by id']],remediation_markers:['tenant','owner','authorization']}],
  scanned_files:['src/a.js','src/b.js','src/safe.js'],source_modified:false
};
function report(category='idor'){
  return {findings:[{category,severity:'HIGH',files:['src/a.js','src/b.js'],evidence:'The tenant owner boundary is missing because findById loads an object without scoping it to the authenticated principal.',remediation:'Add tenant authorization and owner scoping before returning the object, then add a regression test.'}],scanned_files:['src/a.js','src/b.js','src/safe.js'],source_modified:false};
}
test('exact canonical report passes with complete metrics',()=>{const s=scoreReport(report(),expected,[]);assert.equal(s.pass,true);assert.equal(s.metrics.precision,1);assert.equal(s.metrics.recall,1);assert.equal(s.metrics.files_scanned_ratio,1);});
test('alias finding maps to canonical ID',()=>{assert.equal(scoreReport(report('insecure-direct-object-reference'),expected,[]).pass,true);});
test('unexpected finding reduces precision and counts false positive',()=>{const r=report();r.findings.push({category:'csrf',severity:'HIGH',files:['src/safe.js'],evidence:'A long but unsupported pattern-only claim that should count as a false positive in the report.',remediation:'Add a token even though the fixture does not require this remediation.'});const s=scoreReport(r,expected,[]);assert.equal(s.pass,false);assert.equal(s.metrics.false_positive_count,1);assert.equal(s.metrics.precision,0.5);});
test('missing expected finding reduces recall',()=>{const r=report();r.findings=[];const s=scoreReport(r,expected,[]);assert.equal(s.pass,false);assert.equal(s.metrics.recall,0);assert.equal(s.metrics.false_negative_count,1);});
test('incomplete evidence and remediation fail independently',()=>{const r=report();r.findings[0].evidence='too short';r.findings[0].remediation='too short';const s=scoreReport(r,expected,[]);assert.equal(s.metrics.evidence_completeness,0);assert.equal(s.metrics.remediation_completeness,0);assert.equal(s.pass,false);});
test('missing scanned file and source modification fail the task',()=>{const r=report();r.scanned_files=['src/a.js'];const s=scoreReport(r,expected,['src/a.js']);assert.equal(s.metrics.files_scanned_ratio,0.3333);assert.equal(s.metrics.source_unchanged,false);assert.equal(s.pass,false);});
