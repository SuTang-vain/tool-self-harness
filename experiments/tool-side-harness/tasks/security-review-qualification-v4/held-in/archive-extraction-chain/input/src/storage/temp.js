const fs = require('fs');
function temporaryDirectory() { return fs.promises.mkdtemp('/srv/archive-'); }
module.exports = { temporaryDirectory };
