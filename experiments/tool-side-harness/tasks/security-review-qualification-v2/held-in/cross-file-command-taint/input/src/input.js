function readName(req) {
  return String(req.query.name || 'default');
}
module.exports = { readName };
