const { exec } = require('node:child_process');
function convert(req, res) {
  const file = req.query.file;
  exec(`convert uploads/${file} public/out.png`, (error) => {
    if (error) return res.status(500).json({ error: 'conversion failed' });
    res.json({ ok: true });
  });
}
module.exports = { convert };
