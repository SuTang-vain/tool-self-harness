const { TRUSTED_ORIGIN } = require('../config');
function isAllowed(url) { return url.startsWith(TRUSTED_ORIGIN); }
module.exports = { isAllowed };
