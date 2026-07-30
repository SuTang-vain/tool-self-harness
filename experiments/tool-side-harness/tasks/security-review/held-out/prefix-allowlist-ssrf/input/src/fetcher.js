async function fetchPartnerDocument(req, res) {
  const target = req.query.url;
  if (!target.startsWith('https://trusted.example')) {
    return res.status(400).json({ error: 'untrusted host' });
  }
  const response = await fetch(target);
  res.type('text/plain').send(await response.text());
}
module.exports = { fetchPartnerDocument };
