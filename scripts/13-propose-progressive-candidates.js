#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function sha(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function readYAML(file) {
  const src = fs.readFileSync(file, 'utf8'); const root = {}; const stack = [{ indent: -1, obj: root }];
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const m = /^(\s*)([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw); if (!m) continue;
    const key = m[2]; let value = m[3].replace(/#.*$/, '').trim();
    while (stack.length > 1 && stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).obj;
    if (!value) { const child = {}; parent[key] = child; stack.push({ indent, obj: child }); }
    else { parent[key] = value.replace(/^['"]|['"]$/g, ''); }
  }
  return root;
}
function parseSkill(md) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(md);
  if (!m) return { frontmatter: '', body: md, prefix: '' };
  return { frontmatter: m[1], body: md.slice(m[0].length), prefix: m[0] };
}
function description(frontmatter) {
  const m = /^description:\s*(.*)$/m.exec(frontmatter); return m ? m[1].replace(/^['"]|['"]$/g, '') : '';
}
function headingRange(body, title) {
  const lines = body.split('\n'); let start = -1; let level = 0; let offset = 0; let startOffset = 0; let endOffset = body.length;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (start < 0 && m && m[2] === title) { start = i; level = m[1].length; startOffset = offset; }
    else if (start >= 0 && m && m[1].length <= level) { endOffset = offset; break; }
    offset += line.length + (i < lines.length - 1 ? 1 : 0);
  }
  if (start < 0) throw new Error('heading not found: ' + title);
  return [startOffset, endOffset];
}
function surfaceContent(skill, surface) {
  if (surface.selector === 'frontmatter.description') return description(skill.frontmatter);
  if (surface.selector.startsWith('heading:')) {
    const [start, end] = headingRange(skill.body, surface.selector.slice('heading:'.length));
    return skill.body.slice(start, end).replace(/\n+$/, '');
  }
  throw new Error('unsupported selector: ' + surface.selector);
}
function applySurface(md, surface, newContent) {
  const skill = parseSkill(md);
  if (surface.selector === 'frontmatter.description') {
    if (!/^description:/m.test(skill.frontmatter)) throw new Error('description missing');
    const safe = String(newContent).replace(/\n+/g, ' ').trim();
    const frontmatter = skill.frontmatter.replace(/^description:.*$/m, 'description: ' + safe);
    return '---\n' + frontmatter + '\n---\n\n' + skill.body.replace(/^\n+/, '');
  }
  if (surface.selector.startsWith('heading:')) {
    const [start, end] = headingRange(skill.body, surface.selector.slice('heading:'.length));
    const replacement = String(newContent).trim() + '\n';
    return skill.prefix + skill.body.slice(0, start) + replacement + skill.body.slice(end).replace(/^\n*/, '\n');
  }
  throw new Error('unsupported selector: ' + surface.selector);
}
async function main() {
  const [configArg, skillRepoArg, evidenceArg, surfacesArg, target, round, countArg] = process.argv.slice(2);
  if (!configArg || !skillRepoArg || !evidenceArg || !surfacesArg || !target || !round) {
    console.error('Usage: 13-propose-progressive-candidates.js <config> <h0-skill-dir> <held-in-evidence.json> <surfaces.json> <target> <round> [count=3]');
    process.exit(2);
  }
  const count = Number(countArg || 3); if (!Number.isInteger(count) || count < 1) throw new Error('invalid candidate count');
  const config = readYAML(path.resolve(configArg)); const modelCfg = config.model || {};
  const providers = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.zcode', 'v2', 'config.json'), 'utf8')).provider || {};
  const provider = providers[modelCfg.provider_id]; if (!provider?.options?.apiKey) throw new Error('provider credentials unavailable');
  const model = { base:(modelCfg.base_url || provider.options.baseURL || '').replace(/\/$/,''), key:provider.options.apiKey, name:modelCfg.model, max:Number(modelCfg.max_tokens || 8192) };
  const repo = path.resolve(skillRepoArg); const sourcePath = path.join(repo, 'SKILL.md'); const source = fs.readFileSync(sourcePath, 'utf8'); const parsed = parseSkill(source);
  const evidence = JSON.parse(fs.readFileSync(evidenceArg, 'utf8')); const surfaces = JSON.parse(fs.readFileSync(surfacesArg, 'utf8'));
  const visible = Object.fromEntries(surfaces.map(surface => [surface.id, surfaceContent(parsed, surface)]));
  const prompt = [
    'You are the proposer in a preregistered progressive tool-side harness experiment.',
    `Generate exactly ${count} distinct bounded candidates for ${target}.`,
    '', '## Visible held-in evidence only', JSON.stringify(evidence, null, 2),
    '', '## Registered editable surfaces', JSON.stringify(surfaces, null, 2),
    '', '## Current surface content', JSON.stringify(visible, null, 2),
    '', '## Hard constraints',
    '1. Modify exactly one registered surface per candidate.',
    '2. Target only the visible failure: the default project-local directory must be recorded in tracked .gitignore and committed before worktree creation; do not substitute .git/info/exclude.',
    '3. Preserve every listed reliable behavior, especially existing directory selection and baseline tests.',
    '4. Keep the intervention local to Path B state ordering; do not add unrelated rules.',
    '5. Candidates must be materially distinct by placement or mechanism.',
    '6. new_content is the complete replacement content for the selected surface.',
    '7. Do not mention, infer, or optimize for held-out tasks or the official-full skill.',
    '', `Return only a JSON array of ${count} objects:`,
    '{"surface_id":"...","new_content":"...","rationale":"...","expected_effect":"...","regression_risk":"...","expected_q1":"...","expected_q2":"...","expected_q3":"..."}'
  ].join('\n');
  const response = await fetch(model.base + '/chat/completions', { method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+model.key}, body:JSON.stringify({model:model.name,temperature:0,max_tokens:model.max,messages:[{role:'system',content:'Return strict JSON only.'},{role:'user',content:prompt}]}), signal:AbortSignal.timeout(240000) });
  const text = await response.text(); const payload = JSON.parse(text); if (!response.ok || payload.error) throw new Error('API error: '+JSON.stringify(payload.error || payload));
  let content = payload.choices?.[0]?.message?.content || payload.choices?.[0]?.message?.reasoning_content || '';
  content = content.replace(/^\s*<think>[\s\S]*?<\/think>\s*/i, '').trim();
  const fence = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i); if (fence) content = fence[1];
  const proposals = JSON.parse(content); if (!Array.isArray(proposals) || proposals.length !== count) throw new Error('wrong proposal count');
  const out = path.resolve('experiments/tool-side-harness/candidates', target, round); fs.mkdirSync(out, {recursive:true});
  const cluster = evidence.failure_clusters[0]; const repositoryCommit = spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
  const qualification = JSON.parse(fs.readFileSync(path.resolve('experiments/tool-side-harness/rounds/using-git-worktrees/qualification-v3/manifest.json'),'utf8'));
  const createdAt = new Date().toISOString(); const summaries=[];
  proposals.forEach((proposal,index) => {
    const surface = surfaces.find(item => item.id === proposal.surface_id); if (!surface) throw new Error('unknown surface '+proposal.surface_id);
    const dir = path.join(out, 'candidate-'+(index+1)); fs.mkdirSync(dir,{recursive:true});
    const candidateSkill = applySurface(source, surface, proposal.new_content); fs.writeFileSync(path.join(dir,'SKILL.md'),candidateSkill);
    const sourcePatch = {surface_id:proposal.surface_id,new_content:proposal.new_content}; fs.writeFileSync(path.join(dir,'source-patch.json'),JSON.stringify(sourcePatch,null,2)+'\n');
    fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify({rationale:proposal.rationale,expected_effect:proposal.expected_effect,regression_risk:proposal.regression_risk},null,2)+'\n');
    const relativeDir = path.relative(process.cwd(),dir);
    const manifest = {
      schema_version:'progressive-candidate-v1', candidate_id:`${target}-${round}-candidate-${index+1}`, record_type:'prospective', target_id:target,
      parent_lineage:'stable/h0', attribution:{failure_signature:cluster.terminal_cause,level:cluster.implicated_level,fitting_path:cluster.fitting_path,parameter:cluster.parameter},
      patch:{surface_id:proposal.surface_id,surface_count:1,file:path.join(relativeDir,'SKILL.md'),kind:surface.edit_kinds[0],source_patch:path.join(relativeDir,'source-patch.json')},
      expected_delta:{Q1:proposal.expected_q1 || proposal.expected_effect,Q2:proposal.expected_q2 || 'preserve all reliable tasks',Q3:proposal.expected_q3 || 'descriptive only',Q4:'not_measured'},
      held_out_visibility:'hidden-from-proposer',formal_repeats:3,task_tree_sha256:qualification.suite.task_tree_sha256,verifier_sha256:qualification.suite.verifier_sha256,
      model_config:'config.yaml: GLM-5.2 via Volcengine Ark coding/v3',task_order_seed:2026073007,frozen_before_evaluation:true,created_at:createdAt,
      repository_commit:repositoryCommit,parent_skill_sha256:sha(source),skill_sha256:sha(candidateSkill),patch_sha256:sha(JSON.stringify(sourcePatch))
    };
    fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n'); summaries.push({candidate:manifest.candidate_id,surface_id:proposal.surface_id,skill_sha256:manifest.skill_sha256,patch_sha256:manifest.patch_sha256});
  });
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({target,round,parent:'stable/h0',evidence:path.resolve(evidenceArg),held_out_visibility:'hidden-from-proposer',candidate_count:count,evaluation_run_id:'using-git-worktrees-glm-round1-v1',repeats:3,seed:2026073007,candidates:summaries,created_at:createdAt},null,2)+'\n');
  console.log('wrote '+count+' candidates to '+out);
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)});

module.exports = { parseSkill, headingRange, surfaceContent, applySurface };
