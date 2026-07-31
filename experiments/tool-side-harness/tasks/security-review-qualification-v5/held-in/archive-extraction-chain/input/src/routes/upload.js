const { extract } = require('../archive/extract');
module.exports = async function upload(req, res) {
  if (!req.user || req.user.canUpload !== true) return res.sendStatus(403);
  const destination = await temporaryDirectory();
  await extract(req.file.path, destination);
  return res.json({ destination });
};
