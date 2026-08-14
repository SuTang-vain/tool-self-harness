'use strict';
/* Contract checker for hp-02. Reports violations without naming the fix. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();

function rowBlock(src, id) {
  const startRe = new RegExp('(^|\\n)- id: ' + id + '\\s*\\n');
  const m = startRe.exec(src);
  if (!m) return null;
  const start = m.index + (m[0].startsWith('\n') ? 1 : 0);
  const next = /\n- id: /.exec(src.slice(start + 1));
  const end = next ? start + 1 + next.index + 1 : src.length;
  return src.slice(start, end);
}

const src = fs.readFileSync(path.join(ws, 'agent.cordis.yml'), 'utf8');
const violations = [];
const block = rowBlock(src, 'tool-todo');
if (block === null) violations.push("tool surface incomplete: required row 'tool-todo' is missing");
else {
  const name = /^  name:\s*'?([^'\n]+)'?/m.exec(block);
  const pkg = name ? name[1] : '';
  // naming convention: a tool row's package must live in the tool namespace and end with the row id
  if (!/^@deepseek-ai\/dsh-[a-z0-9-]+$/.test(pkg) || !pkg.endsWith('tool-todo')) {
    violations.push("row 'tool-todo' references unknown package '" + pkg + "'");
  }
}
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('check passed: package references resolve');
