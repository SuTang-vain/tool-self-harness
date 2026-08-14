'use strict';
/* Contract checker for hp-03. Reports violations without naming the fix. */
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
const block = rowBlock(src, 'compaction-basic');
if (block === null) violations.push("row 'compaction-basic' is missing");
else {
  const t = /^    thresholdRatio:\s*(\S+)/m.exec(block);
  const v = t ? Number(t[1]) : NaN;
  if (!(Number.isFinite(v) && v > 0 && v <= 1)) {
    violations.push('invalid config: $.thresholdRatio must be a number in (0,1] — restore the reference value documented in the harness');
  }
}
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('check passed: config within schema bounds');
