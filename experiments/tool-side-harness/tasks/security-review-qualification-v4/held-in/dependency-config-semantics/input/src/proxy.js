const TRUSTED = new Set(['10.0.0.10','10.0.0.11']);
function trustProxy(address) { return TRUSTED.has(address); }
module.exports = { trustProxy };
