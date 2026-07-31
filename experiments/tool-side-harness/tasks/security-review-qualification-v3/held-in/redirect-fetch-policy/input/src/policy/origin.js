function exactTrustedOrigin(value) {
  const parsed = new URL(value);
  return parsed.protocol === 'https:' && parsed.hostname === 'images.example.test' && parsed.port === '';
}
module.exports = { exactTrustedOrigin };
