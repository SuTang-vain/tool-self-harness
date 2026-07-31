const { readDocument } = require('./storage');
function download(req, res) {
  return res.send(readDocument(decodeURIComponent(req.query.name)));
}
module.exports = { download };
