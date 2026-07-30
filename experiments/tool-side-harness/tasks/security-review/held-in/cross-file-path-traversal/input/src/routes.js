const storage = require('./storage');
async function download(req, res) {
  const body = await storage.readDocument(req.params.name);
  res.type('text/plain').send(body);
}
module.exports = { download };
