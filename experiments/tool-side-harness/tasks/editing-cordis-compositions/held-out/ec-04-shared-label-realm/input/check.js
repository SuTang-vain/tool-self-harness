'use strict';
/* Contract checker for ec-04. Reports violations without naming the fix. */
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

const block = rowBlock(src, 'delegation');
if (block === null) violations.push("group 'delegation' is missing");
else {
  const iso = /^  isolate:\s*\n((?:    [A-Za-z0-9_\-]+:\s*\S+\n?)+)/m.exec(block);
  if (!iso) violations.push("group 'delegation' has no isolate realm");
  else {
    const entries = iso[1].split('\n').filter(Boolean);
    for (const line of entries) {
      const kv = /^    ([A-Za-z0-9_\-]+):\s*(\S+)\s*$/.exec(line);
      if (kv && kv[2] !== 'true') violations.push("group 'delegation' isolate realm '" + kv[1] + "' is not private to each mounting session");
    }
  }
}

if (violations.length) {
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('check passed: realm is per-session');
