const { exactTrustedOrigin } = require('../policy/origin');
module.exports = async function avatar(req, res) {
  if (!exactTrustedOrigin(req.query.url)) return res.sendStatus(400);
  return res.send(await fetch(req.query.url, { redirect: 'manual' }).then(r => r.arrayBuffer()));
};
