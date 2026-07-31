const { allowedPrefix } = require('./origin');
async function fetchPreview(req) {
  const url = String(req.query.url || '');
  if (!allowedPrefix(url)) throw new Error('untrusted origin');
  return fetch(url);
}
module.exports = { fetchPreview };
