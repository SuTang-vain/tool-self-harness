'use strict';
/*
 * yaml-surface.js — surface bounding for DSH preset compositions.
 *
 * Adds two surface types to tool-self-harness's scripts/lib/patch.js model:
 *
 *   { type: 'yaml-row', file: 'agent.cordis.yml', selector: 'row:<id>' }
 *     — bounds the top-level `- id: <id>` block (from the row start to the next
 *       top-level `- id:` or EOF). Rewrite/trim edits are contained to the row.
 *
 *   { type: 'preset-field', file: 'preset.yml', selector: 'frontmatter.<field>' }
 *     — bounds a single top-level `field: value` line of preset.yml.
 *
 * Wire-in (scripts/lib/patch.js): import these two functions and dispatch on
 * surface.type before the existing SKILL.md handlers. The existing
 * frontmatter-field / body-section / whole-file types are unchanged.
 *
 * Minimality is preserved: a yaml-row patch cannot touch bytes outside its
 * row block, and a preset-field patch cannot touch any other line.
 */
const fs = require('fs');
const path = require('path');

function rowBlock(src, rowId) {
  const startRe = new RegExp('(^|\\n)- id: ' + rowId + '\\s*\\n');
  const m = startRe.exec(src);
  if (!m) return null;
  const start = m.index + (m[0].startsWith('\n') ? 1 : 0);
  const next = new RegExp('\\n- id: ').exec(src.slice(start + 1));
  const end = next ? start + 1 + next.index + 1 : src.length; // keep the newline before next row out
  // Comment banners between two rows document the NEXT row: trim trailing
  // comment/blank lines so the block covers exactly the row's own bytes.
  let content = src.slice(start, end);
  content = content.replace(/(?:\n[ \t]*(?:#[^\n]*)?[ \t]*)*$/, '');
  return { start, end, contentEnd: start + content.length, content };
}

function getSurface(surface, sandboxRoot) {
  const fp = path.join(sandboxRoot, surface.file);
  const src = fs.readFileSync(fp, 'utf8');
  if (surface.type === 'yaml-row') {
    const id = String(surface.selector || '').replace(/^row:/, '');
    const b = rowBlock(src, id);
    return b ? b.content : null;
  }
  if (surface.type === 'preset-field') {
    const field = String(surface.selector || '').replace(/^frontmatter\./, '');
    const re = new RegExp('^' + field + ':\\s*(.*)$', 'm');
    const m = re.exec(src);
    return m ? m[1].trim() : null;
  }
  throw new Error('unknown surface type for yaml-surface: ' + surface.type);
}

function applyPatch(surface, newContent, sandboxRoot) {
  const fp = path.join(sandboxRoot, surface.file);
  const src = fs.readFileSync(fp, 'utf8');
  let out;
  if (surface.type === 'yaml-row') {
    const id = String(surface.selector || '').replace(/^row:/, '');
    const b = rowBlock(src, id);
    if (!b) throw new Error('row not found: ' + id);
    // Replace exactly the row's own bytes: banners before the next row and the
    // kept newline between them survive (src.slice(b.contentEnd) starts with \n).
    const replacement = newContent.replace(/\n+$/, '');
    out = src.slice(0, b.start) + replacement + src.slice(b.contentEnd);
  } else if (surface.type === 'preset-field') {
    const field = String(surface.selector || '').replace(/^frontmatter\./, '');
    const re = new RegExp('^' + field + ':.*$', 'm');
    if (!re.test(src)) throw new Error('field not found: ' + field);
    out = src.replace(re, field + ': ' + newContent);
  } else {
    throw new Error('unknown surface type for yaml-surface: ' + surface.type);
  }
  fs.writeFileSync(fp, out);
  return { __yaml_file: true, file: surface.file, content: out };
}

module.exports = { getSurface, applyPatch, rowBlock };
