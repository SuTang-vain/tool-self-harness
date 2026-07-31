const invoices = require('./invoices');
async function getInvoice(req, res) {
  const invoice = await invoices.findById(req.params.id);
  if (!invoice) return res.sendStatus(404);
  return res.json(invoice);
}
module.exports = { getInvoice };
