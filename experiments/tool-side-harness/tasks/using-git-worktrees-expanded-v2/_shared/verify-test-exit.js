'use strict';

function observedTestExit(event) {
  const result = event.result || {};
  const combined = String(result.stdout || '') + '\n' + String(result.stderr || '');
  const explicit = [...combined.matchAll(/(?:TEST[-_ ]?EXIT[-_ ]?CODE|EXIT(?:[-_ ]?CODE)?)\s*[:=]?\s*(\d+)/gi)].pop();
  return explicit ? Number(explicit[1]) : Number(result.exit_code);
}

module.exports = { observedTestExit };
