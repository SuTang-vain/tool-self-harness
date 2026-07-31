const CLIENTS = { portal: { baseUrl: 'https://portal.example.test' } };
function byId(id) { return CLIENTS[id]; }
module.exports = { byId };
