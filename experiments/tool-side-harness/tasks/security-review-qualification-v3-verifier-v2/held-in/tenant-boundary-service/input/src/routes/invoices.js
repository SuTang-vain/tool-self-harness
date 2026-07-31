const router = require('express').Router();
const invoices = require('../repos/invoices');
router.get('/:id', async (req, res) => {
  const invoice = await invoices.findById(req.params.id);
  if (!invoice) return res.sendStatus(404);
  return res.json(invoice);
});
module.exports = router;
