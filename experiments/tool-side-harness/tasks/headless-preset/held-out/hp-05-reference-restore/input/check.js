'use strict';
/* General contract checker for hp-05. It never localizes reference deviations. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();
const src = fs.readFileSync(path.join(ws, 'agent.cordis.yml'), 'utf8');
const violations = [];
for (const id of ['settings', 'credentials', 'llm-deepseek', 'agent-spine', 'persistence', 'compaction-basic', 'tool-fs', 'eval-pin']) {
  if (!new RegExp('^- id: ' + id + '\\s*$', 'm').test(src)) violations.push("required row '" + id + "' is missing");
}
const tr = /^    thresholdRatio:\s*(\S+)/m.exec(src);
if (!tr || !(Number(tr[1]) > 0 && Number(tr[1]) <= 1)) violations.push('invalid config: $.thresholdRatio must be a number in (0,1]');
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('general contract checks pass; verify the composition matches the documented reference contract');
