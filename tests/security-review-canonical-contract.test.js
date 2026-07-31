'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {scoreReport}=require('../experiments/tool-side-harness/tasks/security-review-qualification-v5/_shared/score');
const {TAXONOMY,isCanonicalId}=require('../experiments/tool-side-harness/tasks/security-review-qualification-v5/_shared/verify-canonical');
const expected={findings:[{canonical_id:'ssrf',minimum_severity:'HIGH',files:['src/fetch.js'],evidence_groups:[['url'],['private']],remediation_markers:['allowlist']}],scanned_files:['src/fetch.js'],source_modified:false};
function report(overrides={}){return {findings:[{canonical_id:'ssrf',category_label:'Server-side request forgery',severity:'HIGH',files:['src/fetch.js'],evidence:'An attacker controls the URL and can reach a private network destination through the server-side fetch operation.',remediation:'Use a strict allowlist and validate every redirect before any outbound request is sent.',...(overrides.finding||{})}],scanned_files:['src/fetch.js'],source_modified:false,...overrides};}
test('publishes a finite global taxonomy containing every expected fixture ID',()=>{assert.equal(TAXONOMY.length,16);assert.equal(isCanonicalId('ssrf'),true);assert.equal(isCanonicalId('SSRF'),false);});
test('accepts an exact canonical ID',()=>{assert.equal(scoreReport(report(),expected,[]).pass,true);});
test('free-form category_label is descriptive and does not affect scoring',()=>{assert.equal(scoreReport(report({finding:{category_label:'arbitrary prose'}}),expected,[]).pass,true);});
test('rejects an alias even when category_label names the correct weakness',()=>{const score=scoreReport(report({finding:{canonical_id:'server-side-request-forgery',category_label:'SSRF'}}),expected,[]);assert.equal(score.pass,false);assert.equal(score.metrics.structure_valid,false);assert.equal(score.metrics.canonical_id_validity,0);});
test('legacy category cannot substitute for required canonical_id',()=>{const r=report();delete r.findings[0].canonical_id;r.findings[0].category='ssrf';const score=scoreReport(r,expected,[]);assert.equal(score.pass,false);assert.equal(score.metrics.structure_valid,false);});
test('valid taxonomy ID that is wrong for the task remains a false positive',()=>{const score=scoreReport(report({finding:{canonical_id:'open-redirect'}}),expected,[]);assert.equal(score.pass,false);assert.deepEqual(score.false_positive_ids,['open-redirect']);assert.deepEqual(score.false_negative_ids,['ssrf']);});
