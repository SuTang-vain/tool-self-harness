module.exports = function continuation(req, res) {
  return res.redirect(String(req.query.returnTo || '/'));
};
