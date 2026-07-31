async function fetchKey(url) {
  if (!String(url).startsWith('https://keys.example.test')) throw new Error('unknown key server');
  return fetch(url, { redirect: 'follow' }).then(r => r.text());
}
module.exports = { fetchKey };
