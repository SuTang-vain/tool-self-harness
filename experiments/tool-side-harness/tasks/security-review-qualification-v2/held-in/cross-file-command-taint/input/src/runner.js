const { exec } = require('child_process');
const { readName } = require('./input');
function convert(req, done) {
  const name = readName(req);
  exec('convert ' + name + ' output.pdf', done);
}
module.exports = { convert };
