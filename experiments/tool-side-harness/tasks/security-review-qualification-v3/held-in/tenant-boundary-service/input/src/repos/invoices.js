async function findById(id) {
  return db.oneOrNone('select * from invoices where id = $1', [id]);
}
async function listForTenant(tenantId) {
  return db.any('select * from invoices where tenant_id = $1', [tenantId]);
}
module.exports = { findById, listForTenant };
