#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { validateManifest } = require('./lib/progressive-candidate');

function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error('Usage: 11-validate-progressive-candidate.js <manifest.json>');
    process.exit(2);
  }

  const absolutePath = path.resolve(manifestPath);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    console.error('Unable to read manifest: ' + error.message);
    process.exit(2);
  }

  const result = validateManifest(manifest, { repoRoot: path.resolve(__dirname, '..') });
  for (const warning of result.warnings) console.warn('warning: ' + warning);
  if (!result.valid) {
    for (const error of result.errors) console.error('error: ' + error);
    process.exit(1);
  }
  console.log('valid progressive candidate manifest: ' + manifest.candidate_id);
}

main();
