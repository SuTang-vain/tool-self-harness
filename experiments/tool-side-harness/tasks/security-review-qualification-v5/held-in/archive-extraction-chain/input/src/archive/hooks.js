const { exec } = require('child_process');
function runHook(script) { exec('sh ' + script); }
module.exports = { runHook };
