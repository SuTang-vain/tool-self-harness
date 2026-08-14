'use strict';
/* Contract checker for hp-05. Reports violations without naming the fix. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();

function topLevelRowIds(src) {
  const out = [];
  const re = /(^|\n)- id:\s*(\S+)[^\n]*/g;
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[2]);
  return out;
}
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
for (const id of topLevelRowIds(src).filter(id => id.includes('subagent'))) {
  const block = rowBlock(src, id);
  if (block === null) continue;
  const d = /^    maxDepth:\s*(\S+)/m.exec(block);
  if (d && !(Number.isInteger(Number(d[1])) && Number(d[1]) >= 1)) {
    violations.push("invalid config: row '" + id + "' $.maxDepth must be a positive integer");
  }
}
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('check passed: delegation bounds valid');
