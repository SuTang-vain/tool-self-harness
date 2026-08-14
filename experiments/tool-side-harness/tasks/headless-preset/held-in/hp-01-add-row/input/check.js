'use strict';
/* Contract checker for hp-01. Reports violations without naming the fix. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();
const src = fs.readFileSync(path.join(ws, 'agent.cordis.yml'), 'utf8');
const violations = [];
if (!/^- id: tool-todo\s*$/m.test(src)) {
  violations.push("tool surface incomplete: required row 'tool-todo' is missing");
}
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('check passed: tool surface complete');
