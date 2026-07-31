'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalize, canonicalize, expectedAliasMap } = require('../experiments/tool-side-harness/tasks/security-review-qualification-v2/_shared/verify-canonical');

test('normalizes punctuation and whitespace to a stable slug', () => {
  assert.equal(normalize(' Broken Object_Level Authorization '), 'broken-object-level-authorization');
});

test('canonicalizes IDOR aliases', () => {
  assert.equal(canonicalize('IDOR'), 'broken-object-level-authorization');
  assert.equal(canonicalize('insecure direct object reference'), 'broken-object-level-authorization');
});

test('canonicalizes common injection aliases', () => {
  assert.equal(canonicalize('OS Command Injection'), 'command-injection');
  assert.equal(canonicalize('SQLi'), 'sql-injection');
});

test('builds hidden expected aliases without changing canonical IDs', () => {
  const map = expectedAliasMap([{ canonical_id: 'ssrf', aliases: ['server-side-request-forgery'] }]);
  assert.equal(map.ssrf, 'ssrf');
  assert.equal(map['server-side-request-forgery'], 'ssrf');
});

test('keeps unknown categories distinct so false positives cannot alias away', () => {
  assert.equal(canonicalize('csrf'), 'csrf');
  assert.notEqual(canonicalize('csrf'), 'cors-misconfiguration');
});
