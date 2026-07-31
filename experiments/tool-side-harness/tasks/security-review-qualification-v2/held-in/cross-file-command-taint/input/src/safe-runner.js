const { spawn } = require('child_process');
function safeConvert(name, done) {
  spawn('convert', [name, 'output.pdf'], { shell: false }, done);
}
module.exports = { safeConvert };
