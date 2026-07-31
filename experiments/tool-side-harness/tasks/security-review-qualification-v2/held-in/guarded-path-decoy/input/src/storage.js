const path = require('path');
const ROOT = path.resolve(__dirname, '../uploads');
function defaultDocument() {
  return path.join(ROOT, 'public', 'readme.txt');
}
module.exports = { defaultDocument };
