async function findById(id) {
  return db.query('select * from invoices where id = ?', [id]);
}
module.exports = { findById };
