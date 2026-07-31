const { spawn } = require('child_process');
function thumbnail(input) { return spawn('convert', [input, '-thumbnail', '200x200', 'thumb.png'], { shell: false }); }
module.exports = { thumbnail };
