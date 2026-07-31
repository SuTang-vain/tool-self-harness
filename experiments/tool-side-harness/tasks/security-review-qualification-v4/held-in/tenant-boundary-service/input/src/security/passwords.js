const bcrypt = require('bcrypt');
async function verifyPassword(password, digest) { return bcrypt.compare(password, digest); }
module.exports = { verifyPassword };
