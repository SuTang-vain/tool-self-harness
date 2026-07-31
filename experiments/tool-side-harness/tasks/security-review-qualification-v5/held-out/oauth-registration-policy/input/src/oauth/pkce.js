const crypto = require('crypto');
function challenge(verifier) { return crypto.createHash('sha256').update(verifier).digest('base64url'); }
module.exports = { challenge };
