const path = require('path');
const ROOT = path.resolve('/srv/avatars');
function avatarPath(name) {
  const candidate = path.resolve(ROOT, name);
  if (!candidate.startsWith(ROOT + path.sep)) throw new Error('outside avatar root');
  return candidate;
}
module.exports = { avatarPath };
