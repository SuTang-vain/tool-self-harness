#!/usr/bin/env node
'use strict';
/*
 * _shared/verify.js — deterministic grader for DSH preset/skill fixture suites.
 *
 * Usage: node verify.js <workspace> <trace> <expected.json>
 *
 * The workspace is the agent's task cwd. It must contain the files the task
 * asked to edit (agent.cordis.yml and/or preset.yml). expected.json declares
 * a list of checks; the grader passes only when every check passes.
 *
 * Check kinds:
 *   {"kind":"row-exists",  "id":"...", "config":{...}}         row present; optional config subset deep-equal
 *   {"kind":"row-absent-or-disabled", "id":"..."}              row absent or disabled:true
 *   {"kind":"row-disabled", "id":"..."}                         row present with disabled:true
 *   {"kind":"row-in-group", "id":"...", "group_id":"...", "group_isolate":{...}}
 *   {"kind":"group-contains", "group_id":"...", "rows":[...]}   exact nested row id set
 *   {"kind":"row-config", "id":"...", "path":[...], "value":...}  navigate parsed config
 *   {"kind":"preset-field", "file":"preset.yml", "field":"name|description", "match":"regex"}
 *
 * The parser handles the composition dialect used by the frozen fixtures:
 * top-level `- id:` row blocks, `isolate:` maps, `config:` scalar maps with
 * nested `- ` item lists, group `config:` nested row lists, and nested-row
 * config maps. It is a fixture grader, not a YAML implementation.
 */
const fs = require('fs');
const path = require('path');

const [workspaceArg, , expectedArg] = process.argv.slice(2);
if (!workspaceArg || !expectedArg) { console.error('usage: verify.js <workspace> <trace> <expected.json>'); process.exit(2); }
const workspace = path.resolve(workspaceArg);
const expected = JSON.parse(fs.readFileSync(expectedArg, 'utf8'));
const errors = [];

// ---------- scalar conversion ----------
function scalar(v) {
  v = String(v).trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d+\.\d+$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}
function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function deepSubset(sub, obj) {
  for (const k of Object.keys(sub)) {
    if (!(k in obj)) return false;
    if (typeof sub[k] === 'object' && sub[k] !== null && !Array.isArray(sub[k])) {
      if (typeof obj[k] !== 'object' || obj[k] === null || !deepSubset(sub[k], obj[k])) return false;
    } else if (!deepEqual(sub[k], obj[k])) return false;
  }
  return true;
}

// ---------- composition parser (fixture dialect) ----------
function parseComposition(src) {
  const lines = src.split('\n').map((l) => l.replace(/\r$/, ''));
  const rows = [];
  let cur = null;
  let mBlock = null;    // {obj, key, minIndent} active | block
  let mItem = null;     // {obj, key, minIndent} active |- list item
  let mItemBuf = [];    // extra lines of an |- list item

  const flushMBlock = () => { if (mBlock) mBlock = null; };
  const flushMItem = () => {
    if (mItem) { mItem.obj[mItem.key] = mItemBuf.join(' '); mItem = null; mItemBuf = []; }
  };

  const finishRow = () => {
    flushMBlock(); flushMItem();
    if (!cur) return;
    if (cur.config && cur.config.__rows !== undefined) { cur.rows = cur.config.__rows; delete cur.config.__rows; }
    if (cur.config && Object.keys(cur.config).length === 0) delete cur.config;
    delete cur.__lastEmpty;
    if (cur.isolate !== undefined && Object.keys(cur.isolate).length === 0) delete cur.isolate;
    rows.push(cur);
    cur = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (/^\s*(#|$)/.test(raw)) continue;
    const indent = raw.length - raw.trimStart().length;
    const t = raw.trim();

    // active | block: buffer deeper lines; stop at dedent
    if (mBlock) {
      if (indent > mBlock.minIndent && !/^-\s/.test(t)) { mBlock.obj[mBlock.key] = ((mBlock.obj[mBlock.key] || '') + '\n' + t).trim(); continue; }
      flushMBlock();
    }
    // active |- list item: buffer its deeper continuation lines
    if (mItem) {
      if (indent > mItem.minIndent) { mItemBuf.push(t); continue; }
      flushMItem();
    }

    // top-level row start
    if (indent === 0 && /^- id:\s*(.*)$/.test(t)) {
      finishRow();
      cur = { id: scalar(RegExp.$1) };
      continue;
    }
    if (cur === null) continue;

    // row-level fields (indent 2)
    if (indent === 2) {
      const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(t);
      if (!kv) continue;
      const k = kv[1]; const v = kv[2].trim();
      if (v === '|' || v === '|-' || v === '>' || v === '|+') {
        mBlock = { obj: cur, key: k, minIndent: indent };
        cur[k] = '';
        continue;
      }
      if (k === 'isolate') { cur.isolate = {}; continue; }
      if (k === 'config') { cur.config = {}; continue; }
      cur[k] = scalar(v);
      continue;
    }

    // isolate map entries (indent 4) — only while the row's next block is isolate
    if (cur.isolate !== null && cur.isolate !== undefined && indent === 4 && cur.config === undefined) {
      const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(t);
      if (kv) { cur.isolate[kv[1]] = scalar(kv[2]); continue; }
    }

    // config block (indent 4): nested rows, scalar keys, maps, lists, | blocks
    if (indent === 4 && cur.config !== undefined && cur.rows === undefined) {
      const nestedRowStart = /^- id:\s*(.*)$/.exec(t);
      if (nestedRowStart) {
        cur.config.__rows = cur.config.__rows || [];
        cur.config.__rows.push({ id: scalar(nestedRowStart[1]), config: {} });
        continue;
      }
      const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(t);
      if (!kv) continue;
      const k = kv[1]; const v = kv[2].trim();
      cur.__lastEmpty = undefined;
      if (v === '|' || v === '|-' || v === '>' || v === '|+') {
        mBlock = { obj: cur.config, key: k, minIndent: indent };
        cur.config[k] = '';
        continue;
      }
      if (v === '') { cur.config[k] = {}; cur.__lastEmpty = k; continue; }  // nested container (map or upcoming list)
      if (v.startsWith('-')) { cur.config[k] = []; continue; }  // list follows at indent 6
      cur.config[k] = scalar(v);
      continue;
    }

    // config scalar-map entry at indent 6 under a `k:` empty container (e.g. workspaceContext.maxBytes)
    if (indent === 6 && cur && cur.config !== undefined && cur.rows === undefined) {
      const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(t);
      if (kv) {
        const k = kv[1]; const v = kv[2].trim();
        const container = Object.keys(cur.config).reverse().find((ck) => typeof cur.config[ck] === 'object' && cur.config[ck] !== null && !Array.isArray(cur.config[ck]));
        if (container !== undefined) { cur.config[container][k] = scalar(v); continue; }
        continue;
      }
    }

    // list items under a config key (indent 6, e.g. models: [{id, contextWindow}])
    if (indent === 6 && cur && cur.config !== undefined && cur.rows === undefined && /^-\s/.test(t)) {
      const itemText = t.replace(/^-\s*/, '');
      let listKey = Object.keys(cur.config).reverse().find((k) => Array.isArray(cur.config[k]));
      if (listKey === undefined && cur.__lastEmpty !== undefined && typeof cur.config[cur.__lastEmpty] === 'object' && cur.config[cur.__lastEmpty] !== null && !Array.isArray(cur.config[cur.__lastEmpty])) {
        cur.config[cur.__lastEmpty] = [];
        listKey = cur.__lastEmpty;
      }
      if (listKey === undefined) continue;
      const list = cur.config[listKey];
      const ikv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(itemText);
      if (ikv) {
        const item = {}; item[ikv[1]] = scalar(ikv[2]);
        list.push(item);
        for (let j = i + 1; j < lines.length; j++) {
          const r2 = lines[j];
          if (/^\s*(#|$)/.test(r2)) continue;
          const ind2 = r2.length - r2.trimStart().length;
          if (ind2 <= indent) break;
          const k2 = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(r2.trim());
          if (k2 && ind2 === indent + 2) { item[k2[1]] = scalar(k2[2]); i = j; continue; }
          if (/^-\s/.test(r2.trim()) && ind2 === indent) { i = j - 1; break; }
          break;
        }
        continue;
      }
      list.push(scalar(itemText));
      continue;
    }

    // group nested-row fields (indent 6 under a `- id:` at indent 4)
    if (cur && cur.config && cur.config.__rows) {
      const nr = cur.config.__rows[cur.config.__rows.length - 1];
      if (indent >= 6) {
        const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(t);
        if (kv) {
          const k = kv[1]; const v = kv[2].trim();
          if (v === '|' || v === '|-' || v === '>' || v === '|+') { mBlock = { obj: nr, key: k, minIndent: indent }; nr[k] = ''; continue; }
          if (k === 'config') { nr.config = {}; continue; }
          if (v === '') { nr[k] = {}; continue; }
          nr[k] = scalar(v);
          continue;
        }
        continue;
      }
    }

    // nested-row config entries (indent 8 under a nested row's `config:`)
    if (cur && cur.config && cur.config.__rows) {
      const nr = cur.config.__rows[cur.config.__rows.length - 1];
      if (indent === 8 && nr.config !== undefined) {
        const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(t);
        if (kv) { nr.config[kv[1]] = scalar(kv[2]); continue; }
      }
    }

    // list item fields at indent 8 (under a config list item)
    if (indent === 8 && cur && cur.config !== undefined && cur.rows === undefined) {
      const listKey = Object.keys(cur.config).reverse().find((k) => Array.isArray(cur.config[k]));
      if (listKey !== undefined) {
        const list = cur.config[listKey];
        const item = list[list.length - 1];
        if (item && typeof item === 'object') {
          const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(t);
          if (kv) { item[kv[1]] = scalar(kv[2]); continue; }
        }
      }
    }

    if (indent === 0 && /^[A-Za-z0-9_\-]+:\s*/.test(t)) { finishRow(); i--; }
  }
  flushMBlock(); flushMItem();
  finishRow();
  return rows;
}

function parsePreset(src) {
  const out = {};
  for (const raw of src.split('\n')) {
    if (/^\s*(#|$)/.test(raw)) continue;
    const kv = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

function readFileOr(ws, name) {
  const p = path.join(ws, name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

// ---------- load workspace ----------
const compSrc = readFileOr(workspace, 'agent.cordis.yml');
const presetSrc = readFileOr(workspace, 'preset.yml');
const rows = compSrc !== null ? parseComposition(compSrc) : null;
const preset = presetSrc !== null ? parsePreset(presetSrc) : null;
const byId = {};
if (rows) rows.forEach(r => { byId[r.id] = r; });

// ---------- check evaluation ----------
for (const c of expected.checks || []) {
  switch (c.kind) {
    case 'row-exists': {
      const r = byId[c.id];
      if (!r) { errors.push('row-exists: missing row "' + c.id + '"'); break; }
      if (c.config && !deepSubset(c.config, r.config || {})) {
        errors.push('row-exists: config mismatch for "' + c.id + '" — expected ' + JSON.stringify(c.config) + ', got ' + JSON.stringify(r.config));
      }
      break;
    }
    case 'row-absent-or-disabled': {
      const r = byId[c.id];
      if (r && r.disabled !== true) errors.push('row-absent-or-disabled: row "' + c.id + '" is present and enabled');
      break;
    }
    case 'row-disabled': {
      const r = byId[c.id];
      if (!r || r.disabled !== true) errors.push('row-disabled: row "' + c.id + '" is not disabled');
      break;
    }
    case 'row-in-group': {
      const g = byId[c.group_id];
      if (!g) { errors.push('row-in-group: group "' + c.group_id + '" missing'); break; }
      const nested = g.rows || [];
      if (!nested.some(r => r.id === c.id)) errors.push('row-in-group: row "' + c.id + '" not inside group "' + c.group_id + '"');
      if (c.group_isolate && !deepEqual(g.isolate || {}, c.group_isolate)) {
        errors.push('row-in-group: group "' + c.group_id + '" isolate mismatch — expected ' + JSON.stringify(c.group_isolate) + ', got ' + JSON.stringify(g.isolate));
      }
      break;
    }
    case 'group-contains': {
      const g = byId[c.group_id];
      if (!g) { errors.push('group-contains: group "' + c.group_id + '" missing'); break; }
      const nested = (g.rows || []).map(r => r.id).sort();
      const want = (c.rows || []).slice().sort();
      if (JSON.stringify(nested) !== JSON.stringify(want)) {
        errors.push('group-contains: group "' + c.group_id + '" rows ' + JSON.stringify(nested) + ' != expected ' + JSON.stringify(want));
      }
      break;
    }
    case 'row-config': {
      const r = byId[c.id];
      if (!r) { errors.push('row-config: row "' + c.id + '" missing'); break; }
      let node = r.config || {};
      for (const seg of c.path) {
        if (node === null || typeof node !== 'object' || !(seg in node)) { node = undefined; break; }
        node = node[seg];
      }
      if (node === undefined || !deepEqual(node, c.value)) {
        errors.push('row-config: "' + c.id + '" config path ' + JSON.stringify(c.path) + ' = ' + JSON.stringify(node) + ' != expected ' + JSON.stringify(c.value));
      }
      break;
    }
    case 'preset-field': {
      const file = c.file || 'preset.yml';
      const src = readFileOr(workspace, file);
      if (src === null) { errors.push('preset-field: file "' + file + '" missing'); break; }
      const data = parsePreset(src);
      const val = String(data[c.field] || '');
      const re = new RegExp(c.match, c.flags || '');
      if (!re.test(val)) errors.push('preset-field: ' + file + '.' + c.field + ' does not match /' + c.match + '/' + (c.flags || '') + ' (got: ' + val + ')');
      break;
    }
    default:
      errors.push('unknown check kind: ' + c.kind);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('dsh preset verifier passed');
