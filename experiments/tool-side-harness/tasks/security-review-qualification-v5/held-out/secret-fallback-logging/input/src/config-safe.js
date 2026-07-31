function requiredSecret(name) { if (!process.env[name]) throw new Error(name + ' required'); return process.env[name]; }
module.exports = { requiredSecret };
