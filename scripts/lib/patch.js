'use strict';
/*
 * patch.js - apply/revert bounded edits to skill surfaces
 *
 * A patch targets exactly ONE surface (defined in surfaces.yaml) and replaces
 * its content. Patches are expressed as:
 *   { surface_id, new_content, old_content? }
 *
 * For frontmatter-field surfaces (e.g. skill-description), the patch replaces
 * the field value (handling the YAML multiline `>-` form).
 * For body-section surfaces, the patch replaces the section from its heading
 * to the next heading of the same-or-higher level (or EOF).
 *
 * This enforces the paper's minimality constraint (§3.3): each proposal edits
 * only the surface needed, preserving unrelated harness behavior.
 */
const fs = require('fs');

// ---------- parse frontmatter + body ----------
function parseSkillMd(src) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!m) return { frontmatterRaw: '', body: src, frontmatterEnd: 0 };
  return { frontmatterRaw: m[1], body: src.slice(m[0].length), frontmatterEnd: m[0].length };
}

// ---------- get surface content ----------
// For whole-file surfaces, `src` is ignored and the file is read from
// surface.file relative to the sandbox root (passed as sandboxRoot).
function getSurface(src, surface, sandboxRoot) {
  // whole-file: read the entire file
  if (surface.type === 'whole-file') {
    if (!sandboxRoot) throw new Error('whole-file surface requires sandboxRoot');
    const fp = require('path').join(sandboxRoot, surface.file);
    return require('fs').readFileSync(fp, 'utf8');
  }
  const { frontmatterRaw, body } = parseSkillMd(src);
  if (surface.type === 'frontmatter-field') {
    // Extract the field value (handles `field: >-\n  multiline` and `field: value`)
    const lines = frontmatterRaw.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const km = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(lines[i]);
      if (km && km[1] === surface.field) {
        let val = km[2].trim();
        if (val === '' || val === '>-' || val === '>') {
          // multiline: collect indented lines
          const parts = [];
          i++;
          while (i < lines.length && /^\s/.test(lines[i]) && !/^\S/.test(lines[i])) {
            parts.push(lines[i].replace(/^\s+/, ''));
            i++;
          }
          return parts.join(' ');
        }
        return val;
      }
    }
    return null;
  }
  // body-section: from heading to next heading of same-or-higher level (or EOF)
  if (surface.type === 'body-section') {
    const heading = surface.heading;
    const headingLevel = (heading.match(/^#+/) || ['##'])[0].length;
    const startIdx = body.indexOf(heading);
    if (startIdx === -1) return null;
    // find next heading of level <= headingLevel
    const afterStart = startIdx + heading.length;
    const rest = body.slice(afterStart);
    const nextHeadingRe = new RegExp('\n(#{1,' + headingLevel + '}\\s)');
    const nm = nextHeadingRe.exec(rest);
    const endIdx = nm ? afterStart + nm.index + 1 : body.length; // +1 to keep the \n before next heading out
    return body.slice(startIdx, endIdx).replace(/\n$/, '');
  }
  return null;
}

// ---------- apply a patch (returns new src, or writes file for whole-file) ----------
// For whole-file surfaces, returns the new file content (caller writes it).
// For SKILL.md surfaces, returns the new SKILL.md content.
function applyPatch(src, surface, newContent, sandboxRoot) {
  // whole-file: return new content for the reference file (caller writes to disk)
  if (surface.type === 'whole-file') {
    // Return an object signaling a file write; callers check for this.
    return { __whole_file: true, file: surface.file, content: newContent };
  }
  const parsed = parseSkillMd(src);

  if (surface.type === 'frontmatter-field') {
    // Rebuild frontmatter with the field replaced.
    // We preserve the `>-` multiline form for the description field.
    const lines = parsed.frontmatterRaw.split('\n');
    const out = [];
    let i = 0;
    let replaced = false;
    while (i < lines.length) {
      const km = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(lines[i]);
      if (km && km[1] === surface.field && !replaced) {
        // write the new value in multiline form
        out.push(surface.field + ': >-');
        // wrap the new content at ~100 chars per line, prefixed with 2 spaces
        const words = newContent.split(/\s+/);
        let line = '  ';
        for (const w of words) {
          if ((line + w).length > 100) {
            out.push(line);
            line = '  ' + w;
          } else {
            line += (line === '  ' ? '' : ' ') + w;
          }
        }
        if (line.trim()) out.push(line);
        replaced = true;
        // skip old multiline value
        i++;
        while (i < lines.length && /^\s/.test(lines[i]) && !/^\S/.test(lines[i])) i++;
      } else {
        out.push(lines[i]);
        i++;
      }
    }
    const newFm = out.join('\n');
    return '---\n' + newFm + '\n---\n' + parsed.body;
  }

  if (surface.type === 'body-section') {
    const heading = surface.heading;
    const headingLevel = (heading.match(/^#+/) || ['##'])[0].length;
    const startIdx = parsed.body.indexOf(heading);
    if (startIdx === -1) throw new Error('heading not found: ' + heading);
    const afterStart = startIdx + heading.length;
    const rest = parsed.body.slice(afterStart);
    const nextHeadingRe = new RegExp('\n(#{1,' + headingLevel + '}\\s)');
    const nm = nextHeadingRe.exec(rest);
    const endIdx = nm ? afterStart + nm.index + 1 : parsed.body.length;
    const before = parsed.body.slice(0, startIdx);
    const after = parsed.body.slice(endIdx);
    // Ensure a trailing newline before the next heading
    const replacement = newContent.endsWith('\n') ? newContent : newContent + '\n';
    return '---\n' + parsed.frontmatterRaw + '\n---\n' + before + replacement + '\n' + after;
  }

  throw new Error('unknown surface type: ' + surface.type);
}

module.exports = { getSurface, applyPatch, parseSkillMd };
