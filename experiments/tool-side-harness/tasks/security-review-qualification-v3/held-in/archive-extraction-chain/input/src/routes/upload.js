const { extract } = require('../archive/extract');
module.exports = async function upload(req, res) {
  const destination = await temporaryDirectory();
  await extract(req.file.path, destination);
  return res.json({ destination });
};
