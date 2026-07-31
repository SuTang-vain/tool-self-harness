const serialize = require('node-serialize');
function importJob(req) { return serialize.unserialize(req.body.payload); }
module.exports = { importJob };
