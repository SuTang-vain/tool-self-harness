const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../uploads');
function openDownload(name) {
  const candidate = path.resolve(ROOT, name);
  if (candidate === ROOT || !candidate.startsWith(ROOT + path.sep)) {
    throw new Error('outside upload root');
  }
  return fs.createReadStream(candidate);
}
module.exports = { openDownload };
