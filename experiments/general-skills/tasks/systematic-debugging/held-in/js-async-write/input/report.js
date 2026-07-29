import { writeFile } from 'node:fs/promises';

export async function saveReport(path, report) {
  writeFile(path, JSON.stringify(report, null, 2), 'utf8');
}
