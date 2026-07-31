'use strict';
function normalize(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
const GLOBAL_ALIASES = {
  idor:'broken-object-level-authorization', bola:'broken-object-level-authorization',
  'insecure-direct-object-reference':'broken-object-level-authorization', 'object-level-authorization':'broken-object-level-authorization',
  overposting:'mass-assignment', 'over-posting':'mass-assignment', 'unsafe-mass-assignment':'mass-assignment',
  'server-side-request-forgery':'ssrf', 'server-side-request-forgery-ssrf':'ssrf', 'jku-ssrf':'ssrf', 'remote-key-ssrf':'ssrf',
  'unvalidated-redirect':'open-redirect', 'external-redirect':'open-redirect', 'redirect-uri-bypass':'open-redirect', 'oauth-redirect-uri-bypass':'open-redirect',
  'os-command-injection':'command-injection', 'shell-command-injection':'command-injection',
  'directory-traversal':'path-traversal', 'zip-slip':'path-traversal', 'archive-path-traversal':'path-traversal', 'arbitrary-file-read':'path-traversal',
  ssti:'server-side-template-injection', 'template-injection':'server-side-template-injection', 'server-side-template-injection-ssti':'server-side-template-injection',
  xss:'cross-site-scripting', 'stored-xss':'cross-site-scripting', 'html-injection':'cross-site-scripting',
  'hardcoded-credentials':'hardcoded-secret', 'hardcoded-secrets':'hardcoded-secret', 'embedded-secret':'hardcoded-secret', 'secret-in-source':'hardcoded-secret', 'secret-fallback':'hardcoded-secret',
  sqli:'sql-injection', 'sql-injection-vulnerability':'sql-injection',
  'unsafe-deserialization':'insecure-deserialization', 'object-deserialization':'insecure-deserialization', 'untrusted-deserialization':'insecure-deserialization', 'pickle-deserialization':'insecure-deserialization',
  'lodash-prototype-pollution':'prototype-pollution', 'vulnerable-lodash':'prototype-pollution', 'vulnerable-dependency':'prototype-pollution', 'dependency-vulnerability':'prototype-pollution',
  cors:'cors-misconfiguration', 'insecure-cors':'cors-misconfiguration', 'cors-credentials-exposure':'cors-misconfiguration', 'cross-origin-policy-bypass':'cors-misconfiguration',
  'authorization-bypass':'authentication-bypass', 'signature-verification-bypass':'authentication-bypass', 'auth-bypass':'authentication-bypass',
  'sensitive-information-exposure':'sensitive-data-exposure', 'credential-logging':'sensitive-data-exposure', 'secret-logging':'sensitive-data-exposure', 'cleartext-logging':'sensitive-data-exposure'
};
function expectedAliasMap(expectedFindings) {
  const map = {};
  for (const finding of expectedFindings || []) {
    const canonical = normalize(finding.canonical_id || finding.category);
    map[canonical] = canonical;
    for (const alias of finding.aliases || []) map[normalize(alias)] = canonical;
  }
  return map;
}
function canonicalize(value, expectedFindings = []) {
  const normalized = normalize(value);
  const local = expectedAliasMap(expectedFindings);
  return local[normalized] || GLOBAL_ALIASES[normalized] || normalized;
}
module.exports = { normalize, canonicalize, expectedAliasMap, GLOBAL_ALIASES };
