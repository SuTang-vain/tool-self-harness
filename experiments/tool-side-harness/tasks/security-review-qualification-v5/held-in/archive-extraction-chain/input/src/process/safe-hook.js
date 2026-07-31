const { spawn } = require('child_process');
function runApproved(name) {
  if (!['index','thumbnail'].includes(name)) throw new Error('unknown hook');
  return spawn('/usr/local/bin/archive-hook', [name], { shell: false });
}
module.exports = { runApproved };
