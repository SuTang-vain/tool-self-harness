const ALLOWED = new Set(['.txt','.json','.png']);
function allowed(name) { return ALLOWED.has(require('path').extname(name).toLowerCase()); }
module.exports = { allowed };
