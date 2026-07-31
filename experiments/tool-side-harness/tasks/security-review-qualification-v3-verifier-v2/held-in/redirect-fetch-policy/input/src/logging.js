function logOutbound(url) {
  const parsed = new URL(url);
  console.info({ host: parsed.hostname, pathLength: parsed.pathname.length });
}
module.exports = { logOutbound };
