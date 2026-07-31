function exactRedirect(registered, supplied) {
  const a = new URL(registered); const b = new URL(supplied);
  return a.protocol === b.protocol && a.hostname === b.hostname && a.port === b.port && a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
}
module.exports = { exactRedirect };
