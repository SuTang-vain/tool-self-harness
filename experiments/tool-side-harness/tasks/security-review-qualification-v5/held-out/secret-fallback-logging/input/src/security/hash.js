const bcrypt = require('bcrypt');
async function hash(password) { return bcrypt.hash(password, 12); }
module.exports = { hash };
