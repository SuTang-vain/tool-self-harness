function allowedPrefix(url) {
  return url.startsWith('https://trusted.example');
}
module.exports = { allowedPrefix };
