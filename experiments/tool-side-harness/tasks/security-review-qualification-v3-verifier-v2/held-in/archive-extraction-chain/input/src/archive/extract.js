const path = require('path');
const fs = require('fs');
const { runHook } = require('./hooks');
async function extract(archivePath, destination) {
  const archive = await openZip(archivePath);
  for (const entry of archive.entries) {
    const output = path.join(destination, entry.name);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, entry.data);
  }
  if (archive.manifest && archive.manifest.postExtract) runHook(archive.manifest.postExtract);
}
module.exports = { extract };
