const path = require('path');
function safeOutput(root, name) {
  const candidate = path.resolve(root, name);
  if (!candidate.startsWith(path.resolve(root) + path.sep)) throw new Error('outside extraction root');
  return candidate;
}
module.exports = { safeOutput };
