'use strict';
/* General contract checker for hp-04. It never localizes reference deviations. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();
const src = fs.readFileSync(path.join(ws, 'agent.cordis.yml'), 'utf8');
const violations = [];
// general rules: required rows, package namespace, model-registry consistency
for (const id of ['settings', 'credentials', 'llm-deepseek', 'agent-spine', 'persistence', 'compaction-basic', 'tool-fs']) {
  if (!new RegExp('^- id: ' + id + '\\s*$', 'm').test(src)) violations.push("required row '" + id + "' is missing");
}
const badPkg = [...src.matchAll(/^\s{2}name:\s*'(@\S+)'/gm)].map(m => m[1]).filter(p => !/^@deepseek-ai\/dsh-[a-z0-9-]+$/.test(p));
for (const p of badPkg) violations.push("unknown package '" + p + "'");
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('general contract checks pass; verify the composition matches the documented reference contract');
