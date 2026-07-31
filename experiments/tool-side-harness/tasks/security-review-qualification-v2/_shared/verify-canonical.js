'use strict';

function normalize(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const GLOBAL_ALIASES = {
  'idor': 'broken-object-level-authorization',
  'insecure-direct-object-reference': 'broken-object-level-authorization',
  'object-level-authorization': 'broken-object-level-authorization',
  'os-command-injection': 'command-injection',
  'command-execution-injection': 'command-injection',
  'sql-injection-vulnerability': 'sql-injection',
  'sqli': 'sql-injection',
  'embedded-secret': 'hardcoded-secret',
  'secret-in-source': 'hardcoded-secret',
  'unvalidated-redirect': 'open-redirect',
  'insecure-cors': 'cors-misconfiguration',
  'cross-origin-policy-bypass': 'cors-misconfiguration',
  'server-side-request-forgery': 'ssrf',
  'unsafe-deserialization': 'insecure-deserialization',
  'object-deserialization': 'insecure-deserialization',
  'directory-traversal': 'path-traversal',
  'arbitrary-file-read': 'path-traversal'
};

function canonicalize(value, localAliases = {}) {
  const normalized = normalize(value);
  const aliases = { ...GLOBAL_ALIASES };
  for (const [canonical, values] of Object.entries(localAliases)) {
    aliases[normalize(canonical)] = normalize(canonical);
    for (const alias of values || []) aliases[normalize(alias)] = normalize(canonical);
  }
  return aliases[normalized] || normalized;
}

function expectedAliasMap(expectedFindings) {
  const map = {};
  for (const finding of expectedFindings || []) {
    const canonical = normalize(finding.canonical_id || finding.category);
    map[canonical] = canonical;
    for (const alias of finding.aliases || []) map[normalize(alias)] = canonical;
  }
  return map;
}

module.exports = { normalize, canonicalize, expectedAliasMap };
