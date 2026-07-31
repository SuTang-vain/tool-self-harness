'use strict';

const TAXONOMY = Object.freeze([
  'authentication-bypass',
  'broken-object-level-authorization',
  'command-injection',
  'cors-misconfiguration',
  'cross-site-scripting',
  'hardcoded-secret',
  'insecure-deserialization',
  'mass-assignment',
  'open-redirect',
  'path-traversal',
  'prototype-pollution',
  'sensitive-data-exposure',
  'server-side-template-injection',
  'sql-injection',
  'ssrf',
  'vulnerable-dependency'
]);
const TAXONOMY_SET = new Set(TAXONOMY);

function isCanonicalId(value) {
  return typeof value === 'string' && TAXONOMY_SET.has(value);
}

module.exports = { TAXONOMY, isCanonicalId };
