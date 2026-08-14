'use strict';
/* Contract checker for hp-04. Reports violations without naming the fix. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();
const src = fs.readFileSync(path.join(ws, 'agent.cordis.yml'), 'utf8');
const violations = [];
const modelsBlock = /^- id: llm-deepseek\s*\n((?:\s{2}[^\n]*\n?)+?)(?=^- |\Z)/m.exec(src);
const agentsBlock = /^- id: agent-spine\s*\n((?:\s{2}[^\n]*\n?)+?)(?=^- |\Z)/m.exec(src);
if (!modelsBlock) violations.push("row 'llm-deepseek' is missing");
if (!agentsBlock) violations.push("row 'agent-spine' is missing");
if (modelsBlock && agentsBlock) {
  const registered = [...modelsBlock[1].matchAll(/^\s*- id:\s*(\S+)/gm)].map(x => x[1]);
  const referenced = [...agentsBlock[1].matchAll(/^\s*model:\s*'?(\S+?)'?\s*$/gm)].map(x => x[1]);
  for (const model of referenced) {
    if (!registered.includes(model)) {
      violations.push("agent-spine references model '" + model + "' that is not registered in llm-deepseek.models");
    }
  }
}
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('check passed: model registry consistent');
