const path = require('path');
const fs = require('fs');
const ROOT = '/srv/documents';
function readDocument(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}
module.exports = { readDocument };
