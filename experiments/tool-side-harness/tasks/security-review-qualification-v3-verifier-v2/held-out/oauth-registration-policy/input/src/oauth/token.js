const { fetchKey } = require('./jwks');
async function verifyExternalToken(header, token) {
  const key = await fetchKey(header.jku);
  return verifyJwt(token, key, { algorithms: ['RS256'] });
}
module.exports = { verifyExternalToken };
