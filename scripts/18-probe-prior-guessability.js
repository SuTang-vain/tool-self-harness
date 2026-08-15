#!/usr/bin/env node
'use strict';
/*
 * 18-probe-prior-guessability.js — run the frozen prior-guessability probe battery.
 * Usage: node scripts/18-probe-prior-guessability.js <model-config> <probes.json> <out.json> [repeats=3]
 * Single-shot, no-tool completions; deterministic regex scoring; outputs G per probe.
 */
const fs = require('fs');
const path = require('path');

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
    if (val === '') { const child = {}; parent[key] = child; stack.push({ indent, obj: child }); }
    else parent[key] = (val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")) ? val.slice(1, -1) : val;
  }
  return root;
}

async function main() {
  const [configPath, probesPath, outPath, repeatsArg] = process.argv.slice(2);
  if (!configPath || !probesPath || !outPath) { console.error('usage: 18-probe-prior-guessability.js <model-config> <probes.json> <out.json> [repeats]'); process.exit(2); }
  const cfg = readYAML(configPath).model || {};
  const providers = JSON.parse(fs.readFileSync(path.join(require('os').homedir(), '.zcode', 'v2', 'config.json'), 'utf8')).provider || {};
  const provider = providers[cfg.provider_id];
  const model = {
    base_url: (cfg.base_url || (provider && provider.options && provider.options.baseURL) || '').replace(/\/$/, ''),
    api_key: cfg.api_key || (provider && provider.options && provider.options.apiKey),
    model: cfg.model || (provider && Object.keys(provider.models || {})[0]),
    max_tokens: Number(cfg.max_tokens || 1024)
  };
  const battery = JSON.parse(fs.readFileSync(probesPath, 'utf8'));
  const repeats = Math.max(1, Number(repeatsArg || 3));
  const results = [];
  for (const probe of battery.probes) {
    const re = new RegExp(probe.pattern, probe.flags || '');
    let passes = 0;
    const samples = [];
    for (let r = 0; r < repeats; r++) {
      const resp = await fetch(model.base_url + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + model.api_key },
        body: JSON.stringify({ model: model.model, temperature: 0, max_tokens: model.max_tokens, messages: [{ role: 'user', content: probe.prompt }] })
      });
      const json = await resp.json();
      const text = (json.choices && json.choices[0] && json.choices[0].message && (json.choices[0].message.content || '')) || '';
      const pass = re.test(text) ? 1 : 0;
      passes += pass;
      samples.push(text.slice(0, 120));
    }
    results.push({ id: probe.id, target: probe.target, task: probe.task, expected_direction: probe.expected_direction, passes, attempts: repeats, G: passes / repeats, samples });
    console.log(probe.id + ': G=' + passes + '/' + repeats + (probe.expected_direction === 'low' && passes > 0 ? '  <-- above expected' : ''));
  }
  fs.writeFileSync(outPath, JSON.stringify({ battery: probesPath, model: model.model, endpoint: model.base_url, recorded_at: new Date().toISOString(), results }, null, 2) + '\n');
  console.log('written: ' + outPath);
}
main().catch((e) => { console.error(e.stack || e); process.exit(1); });
