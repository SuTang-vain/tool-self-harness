#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function readYAML(file) {
  const src = fs.readFileSync(file, 'utf8');
  const root = {}; const stack = [{ indent: -1, obj: root }];
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const m = /^(\s*)([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw);
    if (!m) continue;
    const key = m[2]; let value = m[3].replace(/#.*$/, '').trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (!value) { const child = {}; parent[key] = child; stack.push({ indent, obj: child }); }
    else { value = value.replace(/^['"]|['"]$/g, ''); parent[key] = value; }
  }
  return root;
}

function parseSkill(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return { frontmatter: '', body: md, description: '' };
  const lines = m[1].split('\n');
  const description = lines.find(line => /^description:\s*/.test(line))?.replace(/^description:\s*/, '') || '';
  return { frontmatter: m[1], body: md.slice(m[0].length).replace(/^\n/, ''), description };
}

async function main() {
  const [configPath, skillRepoArg, evidencePath, surfacesPath, roundId] = process.argv.slice(2);
  if (!configPath || !skillRepoArg || !evidencePath || !surfacesPath || !roundId) {
    console.error('Usage: 07-propose-generic-skill.js <model-config> <skill-repo> <evidence.json> <surfaces.json> <round-id>');
    process.exit(2);
  }
  const config = readYAML(configPath);
  const providerCfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.zcode', 'v2', 'config.json'), 'utf8'));
  const modelCfg = config.model || {};
  const provider = (providerCfg.provider || {})[modelCfg.provider_id];
  if (!provider?.options?.apiKey) throw new Error('provider credentials unavailable');
  const model = {
    base: (modelCfg.base_url || provider.options.baseURL || '').replace(/\/$/, ''),
    key: provider.options.apiKey,
    name: modelCfg.model,
    maxTokens: Number(modelCfg.max_tokens || 8192)
  };
  const repo = path.resolve(skillRepoArg);
  const skill = parseSkill(fs.readFileSync(path.join(repo, 'SKILL.md'), 'utf8'));
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  const surfaces = JSON.parse(fs.readFileSync(surfacesPath, 'utf8'));
  const surfaceContent = {
    'skill-description': skill.description,
    'core-instructions': skill.body
  };
  const prompt = [
    'You are the proposer in a Self-Harness experiment.',
    'Generate exactly 2 distinct, minimal candidates to improve the current procedural skill.',
    '',
    '## Visible evidence (held-in only)',
    JSON.stringify(evidence, null, 2),
    '',
    '## Editable surfaces',
    JSON.stringify(surfaces, null, 2),
    '',
    '## Current surface content',
    JSON.stringify(surfaceContent, null, 2),
    '',
    '## Hard constraints',
    '1. Edit exactly one surface per candidate.',
    '2. Target only the visible held-in failure mechanism; do not mention or infer held-out tasks.',
    '3. Preserve all listed passing behaviors.',
    '4. Candidates must be materially distinct by surface or mechanism.',
    '5. new_content must be the complete replacement content for the selected surface.',
    '',
    'Return ONLY a JSON array with exactly 2 objects, each containing:',
    '{"surface_id":"...","new_content":"...","rationale":"...","expected_effect":"...","regression_risk":"..."}'
  ].join('\n');
  const response = await fetch(model.base + '/chat/completions', {
    method: 'POST',
    headers: {'Content-Type':'application/json', Authorization:'Bearer '+model.key},
    body: JSON.stringify({model:model.name,temperature:0,max_tokens:model.maxTokens,messages:[
      {role:'system',content:'Return strict JSON only. No markdown or prose outside the JSON array.'},
      {role:'user',content:prompt}
    ]}),
    signal: AbortSignal.timeout(240000)
  });
  const text = await response.text();
  const payload = JSON.parse(text);
  if (!response.ok || payload.error) throw new Error('API error: '+JSON.stringify(payload.error || payload));
  const message = payload.choices?.[0]?.message || {};
  let content = message.content || message.reasoning_content || '';
  content = content.replace(/^\s*<think>[\s\S]*?<\/think>\s*/i,'').trim();
  let proposals;
  try { proposals = JSON.parse(content); }
  catch (_) {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced) proposals = JSON.parse(fenced[1]);
    else throw new Error('proposer did not return JSON: '+content.slice(0,1000));
  }
  if (!Array.isArray(proposals) || proposals.length !== 2) throw new Error('expected exactly 2 proposals');
  const outDir = path.resolve('proposals/general/mcp-builder', roundId);
  fs.mkdirSync(outDir, {recursive:true});
  proposals.forEach((proposal,index) => {
    if (!surfaces.some(s => s.id === proposal.surface_id)) throw new Error('unknown surface '+proposal.surface_id);
    const dir = path.join(outDir,String(index+1)); fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'patch.json'),JSON.stringify({surface_id:proposal.surface_id,new_content:proposal.new_content},null,2)+'\n');
    fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify({surface_id:proposal.surface_id,rationale:proposal.rationale,expected_effect:proposal.expected_effect,regression_risk:proposal.regression_risk},null,2)+'\n');
  });
  console.log('wrote '+proposals.length+' proposals to '+outDir);
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)});
