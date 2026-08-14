'use strict';
/* Contract checker for ec-05. Reports violations without naming the fix. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();

function parsePreset(src) {
  const out = {};
  for (const raw of src.split('\n')) {
    if (/^\s*(#|$)/.test(raw)) continue;
    const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

const src = fs.readFileSync(path.join(ws, 'preset.yml'), 'utf8');
const preset = parsePreset(src);
const violations = [];

if (!preset.name) violations.push("preset.yml is missing 'name' — the roster cannot display it");
else if (!/^[a-z0-9][a-z0-9-]*$/.test(preset.name)) violations.push("preset.yml 'name' violates the id constraint");
if (!preset.description || !/workflow/i.test(preset.description)) violations.push("preset.yml 'description' does not state what the preset does");

if (violations.length) {
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('check passed: metadata satisfies the roster contract');
