'use strict';

function observedTestExit(event) {
  const result = event.result || {};
  const combined = String(result.stdout || '') + '\n' + String(result.stderr || '');
  const explicit = [...combined.matchAll(/(?:TEST[-_ ]?EXIT[-_ ]?CODE|EXIT(?:[-_ ]?CODE)?)\s*[:=]?\s*(\d+)/gi)].pop();
  return explicit ? Number(explicit[1]) : Number(result.exit_code);
}

function isBaselineTestCommand(command) {
  return /(?:^|[\s;&|()])npm(?:\s+--prefix(?:=|\s+)(?:"[^"]*"|'[^']*'|\S+))?\s+(?:run\s+)?test(?:\s|[;&|)]|$)/i.test(String(command || '')) ||
    /(?:^|[\s;&|()])node\s+(?:\S+\s+)*test\.js(?:\s|[;&|)]|$)/i.test(String(command || ''));
}

module.exports = { observedTestExit, isBaselineTestCommand };
