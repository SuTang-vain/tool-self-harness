const invoices = require('./invoices');
async function getInvoice(req, res) {
  if (!req.user) return res.status(401).end();
  const invoice = await invoices.findById(req.params.id);
  if (!invoice) return res.status(404).end();
  res.json(invoice);
}
module.exports = { getInvoice };
