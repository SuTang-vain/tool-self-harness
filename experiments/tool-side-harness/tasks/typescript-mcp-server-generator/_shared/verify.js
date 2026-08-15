#!/usr/bin/env node
'use strict';
/*
 * verify.js — hidden grader for the ts-mcp suite: file-content assertions.
 * Usage: node verify.js <workspace> <trace> <expected.json>
 *
 * Check kinds:
 *   {"kind":"file_contains","file":"src/server.ts","pattern":"NodeStreamableHTTPServerTransport","flags":""}
 *   {"kind":"file_not_contains","file":"src/server.ts","pattern":"SSE|WebSocket","flags":""}
 *   {"kind":"file_any_of","file":"src/server.ts","patterns":["StdioServerTransport","NodeStreamableHTTPServerTransport"]}
 */
const fs = require('fs');
const path = require('path');

const [workspaceArg, , expectedArg] = process.argv.slice(2);
if (!workspaceArg || !expectedArg) { console.error('usage: verify.js <workspace> <trace> <expected.json>'); process.exit(2); }
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const errors = [];

for (const c of expected.checks || []) {
  const fp = path.join(workspace, c.file);
  if (!fs.existsSync(fp)) { errors.push(c.file + ' missing'); continue; }
  const content = fs.readFileSync(fp, 'utf8');
  if (c.kind === 'file_contains') {
    if (!new RegExp(c.pattern, c.flags || '').test(content)) errors.push(c.file + ' does not match /' + c.pattern + '/');
  } else if (c.kind === 'file_not_contains') {
    if (new RegExp(c.pattern, c.flags || '').test(content)) errors.push(c.file + ' still matches /' + c.pattern + '/');
  } else if (c.kind === 'file_any_of') {
    if (!(c.patterns || []).some((p) => new RegExp(p, c.flags || '').test(content))) errors.push(c.file + ' matches none of ' + JSON.stringify(c.patterns));
  } else {
    errors.push('unknown check kind: ' + c.kind);
  }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('ts-mcp verifier passed');
