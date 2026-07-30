const { spawn } = require('node:child_process');
const ALLOWED = new Set(['avatar.png', 'banner.jpg']);
function convert(req, res) {
  const file = req.query.file;
  if (!ALLOWED.has(file)) return res.status(400).json({ error: 'unsupported file' });
  const child = spawn('convert', [`uploads/${file}`, 'public/out.png'], { shell: false });
  child.on('close', code => res.status(code === 0 ? 200 : 500).json({ ok: code === 0 }));
}
module.exports = { convert };
