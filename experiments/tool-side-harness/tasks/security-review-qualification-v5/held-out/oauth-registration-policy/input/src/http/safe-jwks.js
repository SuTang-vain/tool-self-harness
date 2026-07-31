async function fixedJwks() { return fetch('https://keys.example.test/.well-known/jwks.json', { redirect: 'manual' }); }
module.exports = { fixedJwks };
