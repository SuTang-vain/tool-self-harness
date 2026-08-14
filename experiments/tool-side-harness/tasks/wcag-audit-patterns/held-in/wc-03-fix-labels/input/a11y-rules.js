'use strict';
/*
 * a11y-rules.js — deterministic WCAG violation detection shared by the
 * agent-facing checker and the hidden grader.
 *
 * Rule set (fixture dialect):
 *   img-missing-alt      <img> without an alt attribute
 *   decorative-alt       alt value describing decoration (skill: decorative images use alt="")
 *   input-missing-label  <input> (not hidden) with no associated <label>
 *   missing-lang         <html> without a lang attribute
 *   missing-title        no <title> element
 *   div-onclick          <div> with an onclick handler and no button role
 *   unclear-link-text    anchor whose text is a non-descriptive phrase like "click here"
 *   missing-h1           no <h1> element
 *   table-missing-headers  a <table> whose first row uses <td> instead of <th>
 */
function violations(html) {
  const out = [];
  const tag = (name) => new RegExp('<' + name + '\\b[^>]*>', 'gi');

  // img rules
  const imgs = html.match(tag('img')) || [];
  imgs.forEach((t) => {
    if (!/\balt\s*=/.test(t)) out.push('img-missing-alt');
  });

  // input label rule
  const inputs = html.match(/<input\b[^>]*>/gi) || [];
  inputs.forEach((t) => {
    if (/\btype\s*=\s*["']?hidden["']?/i.test(t)) return;
    const id = /\bid\s*=\s*["']([^"']+)["']/i.exec(t);
    if (id && html.includes('for="' + id[1] + '"')) return;
    out.push('input-missing-label');
  });

  // html lang rule
  const htmlTag = /<html\b[^>]*>/i.exec(html);
  if (htmlTag && !/\blang\s*=/i.test(htmlTag[0])) out.push('missing-lang');

  // title rule
  if (!/<title\b[^>]*>[^<]*<\/title>/i.test(html)) out.push('missing-title');

  // div onclick rule
  const divs = html.match(/<div\b[^>]*>/gi) || [];
  divs.forEach((t) => {
    if (/\bonclick\s*=/i.test(t) && !/\brole\s*=\s*["']?button["']?/i.test(t)) out.push('div-onclick');
  });

  // link text rule
  const anchors = html.match(/<a\b[^>]*>([\s\S]*?)<\/a>/gi) || [];
  anchors.forEach((a) => {
    const text = a.replace(/<a\b[^>]*>/i, '').replace(/<\/a>/i, '').replace(/<[^>]+>/g, '').trim().toLowerCase();
    if (/(^|\s)click here(\s|$)/.test(text)) out.push('unclear-link-text');
  });

  // h1 rule
  if (!/<h1\b[^>]*>/i.test(html)) out.push('missing-h1');

  // table headers rule
  const tables = html.match(/<table\b[\s\S]*?<\/table>/gi) || [];
  tables.forEach((t) => {
    const row = /<tr\b[\s\S]*?<\/tr>/i.exec(t);
    if (row && /<td\b/i.test(row[0]) && !/<th\b/i.test(row[0])) out.push('table-missing-headers');
  });

  return out;
}

module.exports = { violations };
