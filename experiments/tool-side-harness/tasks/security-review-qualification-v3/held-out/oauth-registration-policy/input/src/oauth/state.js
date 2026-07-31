const crypto = require('crypto');
function newState(session) { const value = crypto.randomBytes(32).toString('hex'); session.oauthState = value; return value; }
function verifyState(session, supplied) { return crypto.timingSafeEqual(Buffer.from(session.oauthState), Buffer.from(supplied)); }
module.exports = { newState, verifyState };
