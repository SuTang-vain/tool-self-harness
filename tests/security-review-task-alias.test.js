'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const root='../experiments/tool-side-harness/tasks/security-review-qualification-v3-verifier-v2';
const {canonicalize}=require(root+'/_shared/verify-canonical');
function expected(split,id){return JSON.parse(fs.readFileSync(require('node:path').join(__dirname,root,split,id,'expected.json'),'utf8')).findings;}
test('task-specific broad access label maps to BOLA only in tenant fixture',()=>{assert.equal(canonicalize('broken-access-control',expected('held-in','tenant-boundary-service')),'broken-object-level-authorization');});
test('task-specific broad access label maps to authentication bypass in signed envelope',()=>{assert.equal(canonicalize('broken-access-control',expected('held-out','signed-job-envelope')),'authentication-bypass');});
test('OAuth mechanism labels map to the intended canonical findings',()=>{const e=expected('held-out','oauth-registration-policy');assert.equal(canonicalize('oauth-redirect-uri-validation',e),'open-redirect');assert.equal(canonicalize('jwt-jku-key-injection',e),'ssrf');assert.equal(canonicalize('authorization',e),'open-redirect');});
test('secrets-management maps to hardcoded secret only in fallback fixture',()=>{assert.equal(canonicalize('secrets-management',expected('held-out','secret-fallback-logging')),'hardcoded-secret');});
