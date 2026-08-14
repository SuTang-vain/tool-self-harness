'use strict';
/* Agent-facing checker for fix tasks: reports rule violations, never fixes. */
const fs = require('fs');
const path = require('path');
const ws = process.argv[2] || process.cwd();
const { violations } = require('./a11y-rules.js');
const html = fs.readFileSync(path.join(ws, 'page.html'), 'utf8');
const found = violations(html);
if (found.length) { console.error(found.map(v => 'violation: ' + v).join('\n')); process.exit(1); }
console.log('page passes the accessibility contract checks');
