async function get(url, options) {
  return fetch(url, { redirect: options.followRedirects ? 'follow' : 'manual', signal: AbortSignal.timeout(3000) }).then(r => r.text());
}
module.exports = { get };
