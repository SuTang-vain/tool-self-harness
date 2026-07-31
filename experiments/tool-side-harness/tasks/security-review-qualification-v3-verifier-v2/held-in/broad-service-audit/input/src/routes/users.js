const users = require('../db/users');
module.exports = async function user(req, res) {
  if (req.user.id !== req.params.id) return res.sendStatus(403);
  return res.json(await users.byId(req.params.id));
};
