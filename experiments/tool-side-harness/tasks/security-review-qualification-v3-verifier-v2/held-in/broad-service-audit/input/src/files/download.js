const path = require('path');
const ROOT = path.resolve('/srv/public');
function publicFile(name) {
  const candidate = path.resolve(ROOT, name);
  if (!candidate.startsWith(ROOT + path.sep)) throw new Error('outside public root');
  return candidate;
}
module.exports = { publicFile };
