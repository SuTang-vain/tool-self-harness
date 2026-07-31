async function adminInvoice(req, res) {
  if (!req.user || req.user.role !== 'admin') return res.sendStatus(403);
  return res.json(await db.query('select * from invoices where id = ?', [req.params.id]));
}
module.exports = { adminInvoice };
