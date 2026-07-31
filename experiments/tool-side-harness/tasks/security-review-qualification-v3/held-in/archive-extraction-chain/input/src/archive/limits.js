function validateArchive(entries) {
  if (entries.length > 500) throw new Error('too many entries');
  if (entries.reduce((n, e) => n + e.size, 0) > 50_000_000) throw new Error('archive too large');
}
module.exports = { validateArchive };
