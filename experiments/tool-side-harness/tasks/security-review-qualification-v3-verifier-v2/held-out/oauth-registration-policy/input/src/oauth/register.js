const clients = require('./client-repo');
function validateRedirect(clientId, redirectUri) {
  const client = clients.byId(clientId);
  return redirectUri.startsWith(client.baseUrl);
}
module.exports = { validateRedirect };
