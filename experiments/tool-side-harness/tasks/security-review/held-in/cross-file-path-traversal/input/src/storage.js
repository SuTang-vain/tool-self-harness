const fs = require('node:fs/promises');
const path = require('node:path');
const DOCUMENT_ROOT = path.join(process.cwd(), 'documents');
async function readDocument(name) {
  return fs.readFile(path.join(DOCUMENT_ROOT, name), 'utf8');
}
module.exports = { readDocument };
