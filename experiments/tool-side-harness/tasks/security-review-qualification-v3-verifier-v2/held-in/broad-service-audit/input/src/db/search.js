async function rawSearch(q) { return db.query("select * from products where name like '%" + q + "%'"); }
module.exports = { rawSearch };
