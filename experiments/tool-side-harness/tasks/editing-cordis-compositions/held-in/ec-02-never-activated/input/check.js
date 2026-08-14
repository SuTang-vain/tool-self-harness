'use strict';
/* Contract checker for ec-02. Reports violations without naming the fix. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();

function topLevelRows(src) {
  const rows = [];
  const re = /(^|\n)- id:\s*(\S+)[^\n]*/g;
  let m;
  while ((m = re.exec(src)) !== null) rows.push({ id: m[2], start: m.index + (m[0].startsWith('\n') ? 1 : 0) });
  return rows;
}
function blockOf(src, rows, id) {
  const idx = rows.findIndex(r => r.id === id);
  if (idx < 0) return null;
  const start = rows[idx].start;
  const end = idx + 1 < rows.length ? rows[idx + 1].start : src.length;
  return src.slice(start, end);
}
function nestedRowIds(block) {
  const out = [];
  const re = /^\s{4}- id:\s*(\S+)/gm;
  let m;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out;
}

const src = fs.readFileSync(path.join(ws, 'agent.cordis.yml'), 'utf8');
const rows = topLevelRows(src);
const violations = [];

const group = blockOf(src, rows, 'compaction');
if (group === null) violations.push("group 'compaction' is missing");
else {
  const nested = nestedRowIds(group);
  if (!nested.includes('compaction-basic')) {
    violations.push("row 'compaction-basic' did not activate: waiting for service 'toolResultPruner'");
  }
}

if (violations.length) {
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('check passed: no waiting rows');
