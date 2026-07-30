#!/usr/bin/env node
'use strict';

// Generic procedural-skill runner for coding/debugging/MCP-building tasks.
// Unlike runner.js, this runner exposes a bounded filesystem + shell surface
// rather than the sg-data-pack-specific CLI dispatcher.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

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

function parseFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return { frontmatter: {}, body: md };
  const fm = {};
  const lines = m[1].split('\n');
  for (let i = 0; i < lines.length;) {
    const km = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(lines[i]);
    if (!km) { i++; continue; }
    const key = km[1];
    let value = km[2].trim();
    if (value === '' || value === '>-' || value === '>') {
      const parts = [];
      i++;
      while (i < lines.length && /^\s/.test(lines[i])) parts.push(lines[i++].trim());
      value = parts.join(' ');
    } else {
      value = value.replace(/^['"]|['"]$/g, '');
      i++;
    }
    fm[key] = value;
  }
  return { frontmatter: fm, body: md.slice(m[0].length).replace(/^\n/, '') };
}

function loadModelConfig(configPath) {
  const cfg = readYAML(configPath);
  const m = cfg.model || {};
  const providers = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.zcode', 'v2', 'config.json'), 'utf8')).provider || {};
  const provider = providers[m.provider_id];
  if (!provider || !provider.options || !provider.options.apiKey) throw new Error('provider credentials unavailable: ' + m.provider_id);
  return {
    base_url: (m.base_url || provider.options.baseURL || '').replace(/\/$/, ''),
    api_key: provider.options.apiKey,
    model: m.model || Object.keys(provider.models || {})[0],
    temperature: Number(m.temperature || 0),
    max_tokens: Number(m.max_tokens || 8192)
  };
}

async function chatComplete(model, messages, tools) {
  const payload = {
    model: model.model,
    messages,
    temperature: model.temperature,
    max_tokens: model.max_tokens,
    tools: tools.map(fn => ({ type: 'function', function: fn }))
  };
  const response = await fetch(model.base_url + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + model.api_key
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(240000)
  });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); }
  catch (_) { throw new Error('non-JSON API response (' + response.status + '): ' + text.slice(0, 500)); }
  if (!response.ok || json.error) throw new Error('API error: ' + JSON.stringify(json.error || json).slice(0, 500));
  return json;
}

function resolveInside(root, requested, mustExist = true) {
  const resolvedRoot = fs.realpathSync(root);
  const candidate = path.resolve(resolvedRoot, requested || '.');
  const checked = mustExist && fs.existsSync(candidate) ? fs.realpathSync(candidate) : candidate;
  if (checked !== resolvedRoot && !checked.startsWith(resolvedRoot + path.sep)) throw new Error('path escapes workspace: ' + requested);
  return checked;
}

function buildTools(skillEnabled) {
  const tools = [
    {
      name: 'list_dir', description: 'List a directory inside the task workspace.',
      parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
    },
    {
      name: 'read_file', description: 'Read a UTF-8 file inside the task workspace.',
      parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
    },
    {
      name: 'write_file', description: 'Create or replace a UTF-8 file inside the task workspace.',
      parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] }
    },
    {
      name: 'edit_file', description: 'Replace exactly one occurrence of old_text in a workspace file.',
      parameters: { type: 'object', properties: { path: { type: 'string' }, old_text: { type: 'string' }, new_text: { type: 'string' } }, required: ['path', 'old_text', 'new_text'] }
    },
    {
      name: 'run_command', description: 'Run a shell command in the task workspace. Use this for tests and inspection.',
      parameters: { type: 'object', properties: { command: { type: 'string' }, timeout_ms: { type: 'integer' } }, required: ['command'] }
    },
    {
      name: 'git_diff', description: 'Show the current workspace git diff.',
      parameters: { type: 'object', properties: {} }
    }
  ];
  if (skillEnabled) {
    tools.unshift(
      { name: 'list_skills', description: 'List available skills and metadata.', parameters: { type: 'object', properties: {} } },
      { name: 'load_skill', description: 'Load the full SKILL.md body.', parameters: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
      { name: 'read_skill_file', description: 'Read a reference file bundled with the loaded skill.', parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } }
    );
  }
  return tools;
}

function makeExecutor(workDir, skill) {
  return function execute(name, args) {
    try {
      if (name === 'list_skills') return { skills: [{ name: skill.name, description: skill.description }] };
      if (name === 'load_skill') return args.name === skill.name ? { name: skill.name, body: skill.body } : { error: 'unknown skill' };
      if (name === 'read_skill_file') {
        const target = resolveInside(skill.repo, args.path);
        return { content: fs.readFileSync(target, 'utf8') };
      }
      if (name === 'list_dir') {
        const target = resolveInside(workDir, args.path);
        return { entries: fs.readdirSync(target, { withFileTypes: true }).map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' })) };
      }
      if (name === 'read_file') return { content: fs.readFileSync(resolveInside(workDir, args.path), 'utf8') };
      if (name === 'write_file') {
        const target = resolveInside(workDir, args.path, false);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, args.content);
        return { ok: true, path: args.path, bytes: Buffer.byteLength(args.content) };
      }
      if (name === 'edit_file') {
        const target = resolveInside(workDir, args.path);
        const src = fs.readFileSync(target, 'utf8');
        const first = src.indexOf(args.old_text);
        if (first < 0) return { error: 'old_text not found' };
        if (src.indexOf(args.old_text, first + args.old_text.length) >= 0) return { error: 'old_text occurs more than once' };
        fs.writeFileSync(target, src.slice(0, first) + args.new_text + src.slice(first + args.old_text.length));
        return { ok: true, path: args.path };
      }
      if (name === 'run_command') {
        const timeout = Math.max(1000, Math.min(Number(args.timeout_ms || 120000), 180000));
        const r = spawnSync('/bin/zsh', ['-lc', args.command], { cwd: workDir, encoding: 'utf8', timeout, maxBuffer: 20 * 1024 * 1024 });
        return { exit_code: r.status == null ? -1 : r.status, stdout: (r.stdout || '').slice(0, 30000), stderr: (r.stderr || '').slice(0, 30000), timed_out: Boolean(r.error && r.error.code === 'ETIMEDOUT') };
      }
      if (name === 'git_diff') {
        const r = spawnSync('git', ['diff', '--no-ext-diff'], { cwd: workDir, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
        return { exit_code: r.status == null ? -1 : r.status, diff: (r.stdout || '').slice(0, 30000), stderr: (r.stderr || '').slice(0, 2000) };
      }
      return { error: 'unknown tool: ' + name };
    } catch (error) {
      return { error: String(error && error.message || error) };
    }
  };
}

async function main() {
  const [configPath, skillArg, taskMdPath, workDirArg, traceArg, maxStepsArg] = process.argv.slice(2);
  if (!configPath || !skillArg || !taskMdPath || !workDirArg || !traceArg) {
    console.error('Usage: generic-runner.js <model-config.yaml> <skill-repo|none> <task.md> <work-dir> <trace.jsonl> [max-steps]');
    process.exit(2);
  }
  const model = loadModelConfig(configPath);
  const workDir = path.resolve(workDirArg);
  const tracePath = path.resolve(traceArg);
  const maxSteps = Number(maxStepsArg || 30);
  const skillEnabled = skillArg !== 'none';
  let skill = { name: '', description: '', body: '', repo: '' };
  if (skillEnabled) {
    const repo = path.resolve(skillArg);
    const parsed = parseFrontmatter(fs.readFileSync(path.join(repo, 'SKILL.md'), 'utf8'));
    skill = {
      name: parsed.frontmatter.name || path.basename(repo),
      description: parsed.frontmatter.description || parsed.frontmatter.summary || '',
      body: parsed.body,
      repo
    };
  }
  const task = fs.readFileSync(taskMdPath, 'utf8');
  const tools = buildTools(skillEnabled);
  const toolNames = tools.map(t => t.name).join(', ');
  const system = [
    'You are a coding agent working in an isolated task workspace.',
    'WORKSPACE: ' + workDir,
    'All file tools are restricted to this workspace. Do not search for hidden tests, expected patches, or files outside it.',
    skillEnabled ? 'AVAILABLE SKILL: ' + skill.name + ': ' + skill.description : 'NO SKILLS ARE AVAILABLE. Solve the task using your normal reasoning.',
    skillEnabled ? 'Use list_skills and load_skill when the skill is relevant. Use read_skill_file only for references named by the skill.' : '',
    'TOOLS: ' + toolNames + '.',
    'Reproduce the problem, make the smallest correct change, run relevant tests, then run the full test suite before finishing.'
  ].filter(Boolean).join('\n\n');

  fs.mkdirSync(path.dirname(tracePath), { recursive: true });
  const trace = fs.createWriteStream(tracePath);
  const log = event => trace.write(JSON.stringify({ t: Date.now(), ...event }) + '\n');
  const messages = [{ role: 'system', content: system }, { role: 'user', content: task }];
  const execute = makeExecutor(workDir, skill);
  log({ type: 'task_start', work_dir: workDir, skill: skillEnabled ? skill.name : null });
  log({ type: 'system_prompt', content: system });
  log({ type: 'user_message', content: task });

  let finalAnswer = null;
  let errorState = null;
  let steps = 0;
  const startedAt = Date.now();
  const metrics = {
    api_calls: 0,
    api_latency_ms: 0,
    tool_calls: 0,
    tool_call_retries: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    usage_observations: 0
  };
  while (steps < maxSteps) {
    steps++;
    let response;
    const apiStartedAt = Date.now();
    try {
      response = await chatComplete(model, messages, tools);
      metrics.api_calls++;
      metrics.api_latency_ms += Date.now() - apiStartedAt;
      if (response.usage) {
        metrics.usage_observations++;
        metrics.prompt_tokens += Number(response.usage.prompt_tokens || 0);
        metrics.completion_tokens += Number(response.usage.completion_tokens || 0);
        metrics.total_tokens += Number(response.usage.total_tokens || 0);
      }
    }
    catch (error) { errorState = 'api_error: ' + error.message; log({ type: 'api_error', step: steps, error: errorState }); break; }
    const choice = response.choices && response.choices[0];
    if (!choice) { errorState = 'no_choices'; break; }
    const msg = choice.message || {};
    if (msg.reasoning_content) log({ type: 'reasoning', step: steps, content: msg.reasoning_content });
    log({ type: 'assistant', step: steps, content: msg.content || '', tool_calls: msg.tool_calls || [], finish_reason: choice.finish_reason });

    const toolCalls = msg.tool_calls || [];
    const parsedCalls = [];
    let invalidToolCall = false;
    for (const call of toolCalls) {
      try {
        parsedCalls.push({ call, args: JSON.parse(call.function.arguments || '{}') });
      } catch (_) {
        invalidToolCall = true;
        break;
      }
    }
    if (invalidToolCall || (choice.finish_reason === 'length' && toolCalls.length > 0)) {
      // Do not append a truncated tool call to conversation history: many APIs
      // reject the next request because its function arguments are invalid JSON.
      messages.push({ role: 'assistant', content: msg.content || 'The tool call was truncated.' });
      messages.push({ role: 'user', content: 'Your tool call was truncated or invalid. Retry with one concise, complete tool call. Do not repeat the analysis.' });
      metrics.tool_call_retries++;
      log({ type: 'tool_call_retry', step: steps, reason: choice.finish_reason === 'length' ? 'length' : 'invalid_json' });
      continue;
    }

    messages.push({ role: 'assistant', content: msg.content || '', tool_calls: toolCalls });
    if (parsedCalls.length) {
      metrics.tool_calls += parsedCalls.length;
      for (const { call, args: parsedArgs } of parsedCalls) {
        const result = execute(call.function.name, parsedArgs);
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
        log({ type: 'tool_call', step: steps, name: call.function.name, args: parsedArgs, result });
      }
      continue;
    }
    if (choice.finish_reason === 'stop' || (msg.content && msg.content.trim())) {
      finalAnswer = msg.content || '';
      log({ type: 'final_answer', step: steps, content: finalAnswer });
      break;
    }
    if (choice.finish_reason === 'length') {
      messages.push({ role: 'user', content: 'Continue concisely: finish the implementation and run the tests.' });
      continue;
    }
    break;
  }
  if (!finalAnswer && !errorState) errorState = 'max_steps_reached';
  const finalMetrics = { ...metrics, elapsed_ms: Date.now() - startedAt, steps };
  log({ type: 'task_end', steps, final_answer: finalAnswer, error: errorState, metrics: finalMetrics });
  trace.end();
  console.log(JSON.stringify({ steps, final_answer: finalAnswer, error: errorState, trace_path: tracePath, metrics: finalMetrics }));
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
