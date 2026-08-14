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
  return { start, end, content: src.slice(start, end).replace(/\n$/, '') };
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
    const replacement = newContent.endsWith('\n') ? newContent : newContent + '\n';
    out = src.slice(0, b.start) + replacement + '\n' + src.slice(b.end);
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
