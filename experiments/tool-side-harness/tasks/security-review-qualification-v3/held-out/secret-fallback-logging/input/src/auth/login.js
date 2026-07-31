const logger = require('../logging/logger');
async function login(req, res) {
  const token = await authenticate(req.body.email, req.body.password);
  logger.info({ email: req.body.email, password: req.body.password, token });
  return res.json({ token });
}
module.exports = { login };
