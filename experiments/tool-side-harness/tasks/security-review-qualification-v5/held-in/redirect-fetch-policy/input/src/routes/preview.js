const { isAllowed } = require('../policy/outbound');
const { get } = require('../http/client');
module.exports = async function preview(req, res) {
  const url = String(req.query.url || '');
  if (!isAllowed(url)) return res.sendStatus(400);
  return res.send(await get(url, { followRedirects: true }));
};
