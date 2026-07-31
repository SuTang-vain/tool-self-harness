function oauthLog(event) { console.info({ clientId: event.clientId, outcome: event.outcome }); }
module.exports = { oauthLog };
