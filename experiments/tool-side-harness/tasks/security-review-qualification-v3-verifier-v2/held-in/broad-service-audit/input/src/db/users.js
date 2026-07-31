async function byId(id) { return db.query('select id, email from users where id = ?', [id]); }
module.exports = { byId };
