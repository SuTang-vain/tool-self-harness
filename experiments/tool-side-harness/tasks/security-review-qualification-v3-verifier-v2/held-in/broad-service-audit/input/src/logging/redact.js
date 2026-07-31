function redact(record) { const copy = { ...record }; delete copy.password; delete copy.token; return copy; }
module.exports = { redact };
