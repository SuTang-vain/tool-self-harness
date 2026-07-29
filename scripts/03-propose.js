#!/usr/bin/env node
'use strict';
/*
 * 03-propose.js - generate K diverse, minimal candidate harness edits
 *
 * Usage: node 03-propose.js <config.yaml> <round-N>
 *
 * Implements the Harness Proposal stage (§3.3):
 *   - Invoke the SAME model (self-harness) in a proposer role.
 *   - Provide: the editable surfaces (surfaces.yaml), the current SKILL.md,
 *     the evidence bundle from 02-mine-weakness, and records of passing
 *     behaviors to preserve.
 *   - Generate K proposals, each binding to ONE surface_id, with an audit
 *     record (targeted failure pattern, expected effect, regression risks).
 *   - Candidates must be materially distinct (different surface or mechanism).
 *
 * Writes: proposals/<round>/<j>/{patch.json, audit.json}
 *         where patch.json = {surface_id, new_content}
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const patch = require('./lib/patch');

function readYAML(file) {
  const src = fs.readFileSync(file, 'utf8');
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const m = /^(\s*)([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw);
    if (!m) continue;
    const key = m[2];
    let val = m[3].replace(/#.*$/, '').trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (val === '') {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      parent[key] = val;
    }
  }
  return root;
}

// crude YAML list parser for surfaces.yaml
function readSurfaces(file) {
  const src = fs.readFileSync(file, 'utf8');
  const surfaces = [];
  let cur = null;
  for (const raw of src.split('\n')) {
    const im = /^\s*-\s+id:\s*(\S+)/.exec(raw);
    if (im) {
      if (cur) surfaces.push(cur);
      cur = { id: im[1] };
      continue;
    }
    if (!cur) continue;
    const km = /^\s+(\w+):\s*(.*)$/.exec(raw);
    if (km) {
      const k = km[1];
      let v = km[2].trim();
      if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim().replace(/["']/g, ''));
      else if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      cur[k] = v;
    }
  }
  if (cur) surfaces.push(cur);
  return surfaces;
}

function loadModelConfig(configPath) {
  const cfg = readYAML(configPath);
  const m = cfg.model || {};
  const zcodeCfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.zcode', 'v2', 'config.json'), 'utf8'));
  const prov = (zcodeCfg.provider || {})[m.provider_id];
  if (!prov) throw new Error('Provider not found: ' + m.provider_id);
  if (!prov.options || !prov.options.apiKey) throw new Error('Provider ' + m.provider_id + ' has no apiKey');
  const baseUrl = (typeof m.base_url === 'string' && m.base_url.trim()) ? m.base_url : prov.options.baseURL;
  if (!baseUrl) throw new Error('No base_url for ' + m.provider_id);
  return {
    base_url: baseUrl,
    api_key: prov.options.apiKey,
    model: m.model || Object.keys(prov.models || {})[0],
    temperature: Number(m.temperature || 0),
    max_tokens: Number(m.max_tokens || 8192),
    kind: prov.kind || 'openai'
  };
}

function chatComplete(mc, messages) {
  const body = { model: mc.model, messages, temperature: mc.temperature, max_tokens: mc.max_tokens };
  const res = spawnSync('curl', ['-sS', mc.base_url.replace(/\/$/, '') + '/chat/completions',
    '-H', 'Content-Type: application/json', '-H', 'Authorization: Bearer ' + mc.api_key,
    '-d', JSON.stringify(body), '--max-time', '240'], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  if (res.status !== 0) throw new Error('curl failed: ' + (res.stderr || '').slice(0, 300));
  const json = JSON.parse(res.stdout);
  if (json.error) throw new Error('API error: ' + JSON.stringify(json.error).slice(0, 300));
  return json;
}

function main() {
  const [, , configPath, roundId] = process.argv;
  if (!configPath || !roundId) {
    console.error('Usage: node 03-propose.js <config.yaml> <round-N>');
    process.exit(2);
  }
  const config = readYAML(configPath);
  const harnessRoot = path.dirname(path.resolve(configPath));
  const paths = config.paths || {};
  const K = Number((config.loop || {}).proposals_per_round || 2);
  const mc = loadModelConfig(configPath);
  const sandboxPath = path.resolve(harnessRoot, paths.sandbox || 'sandbox');
  const skillMdPath = path.join(sandboxPath, 'SKILL.md');
  const surfacesPath = path.resolve(harnessRoot, 'surfaces.yaml');
  const evidencePath = path.resolve(harnessRoot, paths.evidence || 'evidence', roundId + '.json');

  if (!fs.existsSync(evidencePath)) {
    console.error('No evidence bundle at ' + evidencePath + '. Run 02-mine-weakness first.');
    process.exit(1);
  }
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  const surfaces = readSurfaces(surfacesPath);
  const currentSkillMd = fs.readFileSync(skillMdPath, 'utf8');

  // Build proposer context
  const passingBehaviors = evidence.per_task.filter(t => t.passed).map(t => t.task_id);
  const clusterSummary = evidence.clusters.map(c =>
    '- Cluster [' + c.cluster_id + '] size=' + c.task_ids.length +
    ' tasks=[' + c.task_ids.join(',') + ']\n' +
    '  cause: ' + c.terminal_cause + '\n' +
    '  surface: ' + c.implicated_surface + '\n' +
    '  note: ' + c.attribution_note + '\n' +
    '  behaviors: ' + c.agent_behaviors.join(' | ') + '\n' +
    '  evidence:\n' + c.evidence_samples.map(e => '    [' + e.task_id + '] ' + e.evidence.replace(/\n/g, '\n    ')).join('\n')
  ).join('\n');

  const surfacesDesc = surfaces.map(s =>
    '- id=' + s.id + ' type=' + s.type + (s.field ? ' field=' + s.field : '') + (s.heading ? ' heading="' + s.heading + '"' : '') + ' edit_kinds=[' + (Array.isArray(s.edit_kinds) ? s.edit_kinds.join(',') : s.edit_kinds) + ']'
  ).join('\n');

  // Current content of each surface
  const currentContents = surfaces.map(s => {
    let content;
    try { content = patch.getSurface(currentSkillMd, s, sandboxPath); }
    catch (e) { content = '(unreadable: ' + e.message + ')'; }
    return '### ' + s.id + ' (current content):\n' + (content || '(empty)') + '\n';
  }).join('\n');

  const proposerPrompt = [
    'You are a harness proposer. Your job: propose ' + K + ' DISTINCT, MINIMAL edits to improve a skill (an agent harness component).',
    '',
    '## Evidence (failure patterns from running the current harness)',
    'Passed tasks (preserve these behaviors): [' + passingBehaviors.join(', ') + ']',
    'Failed clusters (ordered by support):',
    clusterSummary || '(no failures - all tasks passed)',
    '',
    '## Editable surfaces (you may edit exactly ONE surface per proposal)',
    surfacesDesc,
    '',
    '## Current SKILL.md content (per surface)',
    currentContents,
    '',
    '## Constraints (from the Self-Harness paper §3.3)',
    '1. Each proposal edits exactly ONE surface_id. Do not rewrite the whole file.',
    '2. Minimality: modify only what is needed to address the targeted failure mechanism.',
    '3. Diversity: the ' + K + ' proposals must target DIFFERENT surfaces or mechanisms. Do not restate the same fix in different words.',
    '4. Only target a failure pattern if it is plausibly addressable by an editable surface. Skip non-addressable clusters.',
    '5. Preserve passing behaviors - do not remove content that currently works.',
    '',
    '## Output format',
    'Return a JSON array of ' + K + ' objects. Each object:',
    '{',
    '  "surface_id": "<one of the surface ids>",',
    '  "rationale": "<which cluster this addresses and why>",',
    '  "new_content": "<the full new content for that surface, replacing it entirely>",',
    '  "expected_effect": "<what behavioral change you expect>",',
    '  "regression_risk": "<what could break>"',
    '}',
    '',
    'If there are NO addressable failure patterns (e.g. all passed, or failures are model-capability limits), return an empty array [].',
    'Return ONLY the JSON array, no prose.'
  ].join('\n');

  console.log('=== Proposer: generating ' + K + ' candidates for ' + roundId + ' ===');
  const resp = chatComplete(mc, [
    { role: 'system', content: 'You output strict JSON only. No prose, no markdown, no explanation. Return ONLY a JSON array literal.' },
    { role: 'user', content: proposerPrompt }
  ]);
  // Strip reasoning_content if present (some models leak reasoning into content)
  let content = (resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content) || '';
  // Strip  思考 ...  blocks if model leaks its reasoning
  content = content.replace(/^\s*(?:<think>[\s\S]*?<\/think>\s*)+/i, '').trim();

  // Robust JSON array extraction. Try multiple strategies:
  // 1. Whole content is JSON array
  // 2. JSON wrapped in ```json ... ``` fences
  // 3. JSON array embedded somewhere in prose (must start with "[\n" or "[ {")
  let proposals = null;
  let jsonMatch = null;
  const tryParse = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };

  // (1) raw
  if ((proposals = tryParse(content.trim())) && Array.isArray(proposals)) {
    jsonMatch = [content.trim()];
  }
  // (2) fenced
  if (!proposals) {
    const fence = /```(?:json)?\s*(\[[\s\S]*?\])\s*```/.exec(content);
    if (fence && (proposals = tryParse(fence[1])) && Array.isArray(proposals)) jsonMatch = fence;
  }
  // (3) find a "[\n" or "[ {" or "[{" — must look like a JSON array starting position
  if (!proposals) {
    const m = /\[(?:\s*\{[\s\S]*?)(\r?\n|\}\s*,|\]\s*$)/.exec(content);
    // Be permissive: find the first "[" followed by JSON-ish content and try balanced parse
    const startIdx = content.indexOf('[');
    if (startIdx !== -1) {
      // Try to extract a balanced substring starting at [
      let depth = 0, endIdx = -1, inStr = false, esc = false;
      for (let i = startIdx; i < content.length; i++) {
        const ch = content[i];
        if (inStr) {
          if (esc) { esc = false; continue; }
          if (ch === '\\') { esc = true; continue; }
          if (ch === '"') inStr = false;
          continue;
        }
        if (ch === '"') { inStr = true; continue; }
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
      }
      if (endIdx !== -1) {
        const cand = content.slice(startIdx, endIdx + 1);
        if ((proposals = tryParse(cand)) && Array.isArray(proposals)) jsonMatch = [cand];
      }
    }
  }

  if (!proposals) {
    console.error('Proposer did not return a valid JSON array. Response:');
    console.error(content.slice(0, 1500));
    fs.writeFileSync(path.resolve(harnessRoot, paths.proposals || 'proposals', roundId, 'raw-response.txt'), content);
    process.exit(1);
  }

  const propDir = path.resolve(harnessRoot, paths.proposals || 'proposals', roundId);
  fs.mkdirSync(propDir, { recursive: true });
  const accepted = [];
  for (let j = 0; j < proposals.length; j++) {
    const p = proposals[j];
    const surface = surfaces.find(s => s.id === p.surface_id);
    if (!surface) {
      console.log('  [skip] proposal ' + j + ': unknown surface_id "' + p.surface_id + '"');
      continue;
    }
    const jDir = path.join(propDir, String(j + 1));
    fs.mkdirSync(jDir, { recursive: true });
    fs.writeFileSync(path.join(jDir, 'patch.json'), JSON.stringify({ surface_id: p.surface_id, new_content: p.new_content }, null, 2) + '\n');
    fs.writeFileSync(path.join(jDir, 'audit.json'), JSON.stringify({
      surface_id: p.surface_id,
      rationale: p.rationale,
      expected_effect: p.expected_effect,
      regression_risk: p.regression_risk
    }, null, 2) + '\n');
    accepted.push({ j: j + 1, surface_id: p.surface_id, dir: jDir });
    console.log('  [ok] proposal ' + (j + 1) + ': surface=' + p.surface_id + ' | ' + (p.rationale || '').slice(0, 80));
  }

  console.log('\n=== ' + accepted.length + ' proposals written to ' + propDir + ' ===');
}

main();
