const { spawn } = require('child_process');
function resize(file) { return spawn('convert', [file, '-resize', '200x200', 'out.png'], { shell: false }); }
module.exports = { resize };
