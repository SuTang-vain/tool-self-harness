'use strict';
/* Agent-facing checker for audit tasks: format only — never names findings. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();
const reportPath = path.join(ws, 'audit.md');
if (!fs.existsSync(reportPath)) { console.error('audit.md not found'); process.exit(1); }
const report = fs.readFileSync(reportPath, 'utf8');
const sections = (report.match(/^## /gm) || []).length;
if (sections < 1) { console.error('audit.md must be structured with severity sections (## headings)'); process.exit(1); }
if ((report.match(/^- /gm) || []).length < 1) { console.error('audit.md must list findings as bullet items under their severity section'); process.exit(1); }
console.log('audit report format ok');
