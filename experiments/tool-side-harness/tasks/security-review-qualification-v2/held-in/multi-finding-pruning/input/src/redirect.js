function continueTo(req, res) {
  return res.redirect(req.query.next);
}
module.exports = { continueTo };
