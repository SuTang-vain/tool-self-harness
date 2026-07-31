const crypto = require('crypto');
function newState(session) { const value = crypto.randomBytes(32).toString('hex'); session.oauthState = value; return value; }
function verifyState(session, supplied) {
  if (!session.oauthState || !supplied) return false;
  const expected = Buffer.from(session.oauthState); const actual = Buffer.from(supplied);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
module.exports = { newState, verifyState };
