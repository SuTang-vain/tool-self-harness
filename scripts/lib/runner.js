'use strict';
/*
 * runner.js - headless model runner for Tool Self-Harness
 *
 * Faithfully simulates how a coding agent (ZCode/Claude Code) operates a skill:
 *   - Initial system prompt contains ONLY the skill's frontmatter description
 *     (what list_skills() would return). The body is NOT loaded yet.
 *   - Tools exposed: list_skills, load_skill (returns SKILL.md body), read_file,
 *     write_file, list_dir, run_skill (executes a skill CLI subcommand).
 *   - The model drives a tool loop until it produces a final text answer or
 *     hits max_steps.
 *   - Every assistant message + tool call + tool result is appended to trace.jsonl.
 *
 * Why this shape: it makes the skill's "description" surface testable. If the
 * description is bad, the model never calls load_skill and fails. That failure
 * is exactly what Weakness Mining should attribute to the skill-description
 * surface.
 *
 * Usage:
 *   node runner.js <config.yaml> <task-dir> <trace-out.jsonl> [--skill-repo <dir>]
 *
 * The skill-repo under edit is read from config.paths.sandbox (or --skill-repo).
 * The task-dir contains task.md + input/ + verify.sh + expected/.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

// ---------- minimal YAML reader (handles 2-level nesting + comments + quotes) ----------
function readYAML(file) {
  const src = fs.readFileSync(file, 'utf8');
  const root = {};
  // track indentation level -> object
  const stack = [{ indent: -1, obj: root }];
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const m = /^(\s*)([A-Za-z0-9_\-]+):\s*(.*)$/.exec(raw);
    if (!m) continue;
    const key = m[2];
    let val = m[3].replace(/#.*$/, '').trim();
    // pop to parent whose indent < current
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (val === '') {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      parent[key] = val;
    }
  }
  return root;
}

// ---------- frontmatter parse (YAML-ish, just the description field) ----------
function parseFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return { frontmatter: {}, body: md };
  const fmRaw = m[1];
  const body = md.slice(m[0].length).replace(/^\n/, '');
  // crude: grab name and description (description may span lines until next key or ---)
  const fm = {};
  const lines = fmRaw.split('\n');
  let i = 0;
  while (i < lines.length) {
    const km = /^([A-Za-z0-9_\-]+):\s*(.*)$/.exec(lines[i]);
    if (!km) { i++; continue; }
    const key = km[1];
    let val = km[2].trim();
    if (val === '' || val === '>-' || val === '>') {
      // multiline: collect indented lines
      const parts = [];
      i++;
      while (i < lines.length && /^\s/.test(lines[i]) && !/^\S/.test(lines[i])) {
        parts.push(lines[i].replace(/^\s+/, ''));
        i++;
      }
      val = parts.join(' ');
    } else {
      i++;
    }
    fm[key] = val;
  }
  return { frontmatter: fm, body };
}

// ---------- model config ----------
function loadModelConfig(configPath) {
  const cfg = readYAML(configPath);
  const m = cfg.model || {};
  // Read base provider from ZCode config.json (always required for credentials)
  const zcodeCfgPath = path.join(os.homedir(), '.zcode', 'v2', 'config.json');
  const zcodeCfg = JSON.parse(fs.readFileSync(zcodeCfgPath, 'utf8'));
  const prov = (zcodeCfg.provider || {})[m.provider_id];
  if (!prov) throw new Error('Provider not found in config.json: ' + m.provider_id);
  if (!prov.options || !prov.options.apiKey) {
    throw new Error('Provider ' + m.provider_id + ' has no apiKey');
  }
  // base_url: inline override wins; else use provider's. api_key: always from provider.
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

// ---------- chat completion (OpenAI-compatible) ----------
function chatComplete(mc, messages, tools) {
  const body = {
    model: mc.model,
    messages,
    temperature: mc.temperature,
    max_tokens: mc.max_tokens
  };
  if (tools && tools.length) {
    body.tools = tools.map(t => ({ type: 'function', function: t }));
  }
  const res = spawnSync('curl', [
    '-sS',
    mc.base_url.replace(/\/$/, '') + '/chat/completions',
    '-H', 'Content-Type: application/json',
    '-H', 'Authorization: Bearer ' + mc.api_key,
    '-d', JSON.stringify(body),
    '--max-time', '180'
  ], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  if (res.status !== 0) {
    throw new Error('curl failed (status ' + res.status + '): ' + (res.stderr || '').slice(0, 500));
  }
  let json;
  try { json = JSON.parse(res.stdout); } catch (e) {
    throw new Error('non-JSON response: ' + res.stdout.slice(0, 500));
  }
  if (json.error) {
    throw new Error('API error: ' + JSON.stringify(json.error).slice(0, 500));
  }
  return json;
}

// ---------- tool definitions ----------
function buildTools(allowWrite) {
  const tools = [
    {
      name: 'list_skills',
      description: 'List available skills with their descriptions (metadata only; bodies are not loaded).',
      parameters: { type: 'object', properties: {} }
    },
    {
      name: 'load_skill',
      description: 'Load the full body of a skill (the SKILL.md content after frontmatter). Call this once you have identified a relevant skill from list_skills.',
      parameters: { type: 'object', properties: { name: { type: 'string', description: 'skill name' } }, required: ['name'] }
    },
    {
      name: 'list_dir',
      description: 'List files in a directory. Paths are relative to the current working directory (.), not the task.md location.',
      parameters: { type: 'object', properties: { path: { type: 'string', description: 'directory path, relative to cwd (use "." for cwd)' } }, required: ['path'] }
    },
    {
      name: 'read_file',
      description: 'Read a file (utf8). Paths are relative to the current working directory (.), not the task.md location.',
      parameters: { type: 'object', properties: { path: { type: 'string', description: 'file path, relative to cwd' } }, required: ['path'] }
    },
    {
      name: 'run_skill',
      description: 'Execute a skill CLI subcommand. The skill CLI is the sg-data-pack dispatcher. Runs in the current working directory. Returns stdout, stderr, and exit code.',
      parameters: {
        type: 'object',
        properties: {
          subcommand: { type: 'string', description: 'subcommand name: extract, validate, rules, diff, templatize, alias-candidates, types, recrawl-skeleton, schema, loader' },
          args: { type: 'array', items: { type: 'string' }, description: 'positional arguments to the subcommand. Paths in args are relative to the current working directory.' }
        },
        required: ['subcommand']
      }
    }
  ];
  if (allowWrite) {
    tools.push({
      name: 'write_file',
      description: 'Write content to a file (creates or overwrites). Paths are relative to the current working directory.',
      parameters: { type: 'object', properties: { path: { type: 'string', description: 'file path, relative to cwd' }, content: { type: 'string', description: 'file content' } }, required: ['path', 'content'] }
    });
  }
  return tools;
}

// ---------- tool execution ----------
function makeExecutor(cwd, skillName, skillRepoPath) {
  const skillCli = path.join(skillRepoPath, 'scripts', 'sg-data-pack');

  function exec(toolName, args) {
    try {
      switch (toolName) {
        case 'list_skills': {
          // Read the skill's frontmatter description from the skill repo
          const skillMd = fs.readFileSync(path.join(skillRepoPath, 'SKILL.md'), 'utf8');
          const { frontmatter } = parseFrontmatter(skillMd);
          return { skills: [{ name: skillName, description: frontmatter.description || '' }] };
        }
        case 'load_skill': {
          const name = args.name;
          if (name !== skillName) return { error: 'unknown skill: ' + name };
          const skillMd = fs.readFileSync(path.join(skillRepoPath, 'SKILL.md'), 'utf8');
          const { body } = parseFrontmatter(skillMd);
          return { name: skillName, body };
        }
        case 'list_dir': {
          const p = path.resolve(cwd, args.path || '.');
          const entries = fs.readdirSync(p, { withFileTypes: true });
          return { entries: entries.map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' })) };
        }
        case 'read_file': {
          const p = path.resolve(cwd, args.path);
          const content = fs.readFileSync(p, 'utf8');
          return { content };
        }
        case 'write_file': {
          const p = path.resolve(cwd, args.path);
          // Sandbox: writes must stay inside the task work directory
          if (!p.startsWith(cwd + path.sep) && p !== cwd) {
            return { error: 'write_file is sandboxed to the cwd (' + cwd + '); cannot write outside it: ' + p };
          }
          fs.mkdirSync(path.dirname(p), { recursive: true });
          fs.writeFileSync(p, args.content);
          return { ok: true, path: p, bytes: args.content.length };
        }
        case 'run_skill': {
          const sub = args.subcommand;
          const rest = args.args || [];
          if (!fs.existsSync(skillCli)) return { error: 'skill CLI not found at ' + skillCli };
          const r = spawnSync(process.execPath, [skillCli, sub, ...rest], {
            cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 120000
          });
          return {
            exit_code: r.status === null ? -1 : r.status,
            stdout: (r.stdout || '').slice(0, 20000),
            stderr: (r.stderr || '').slice(0, 20000)
          };
        }
      }
    } catch (e) {
      return { error: String(e && e.message || e) };
    }
  }

  return exec;
}

// ---------- main loop ----------
function main() {
  const args = process.argv.slice(2);
  const configPath = args[0];
  const taskDir = path.resolve(args[1]);
  const tracePath = path.resolve(args[2]);
  let skillRepoOverride = null;
  let allowWrite = true;  // write_file is sandboxed to cwd by the executor
  for (let i = 3; i < args.length; i++) {
    if (args[i] === '--skill-repo' && args[i + 1]) { skillRepoOverride = args[++i]; }
    else if (args[i] === '--no-write') { allowWrite = false; }
  }
  if (!configPath || !taskDir || !tracePath) {
    console.error('Usage: node runner.js <config.yaml> <task-dir> <trace-out.jsonl> [--skill-repo <dir>]');
    process.exit(2);
  }

  const config = readYAML(configPath);
  const mc = loadModelConfig(configPath);
  const cfg = config.loop || {};
  const paths = config.paths || {};
  const maxSteps = Number(cfg.max_steps_per_task || 24);

  const skillRepoPath = skillRepoOverride ||
    (paths.sandbox ? path.resolve(path.dirname(configPath), paths.sandbox) : null) ||
    config.target.skill_repo;
  const skillName = config.target.skill_name;

  // Read task
  const taskMd = fs.readFileSync(path.join(taskDir, 'task.md'), 'utf8');

  // Work directory = a fresh copy of the task's input/ so the model can write files
  const workDir = path.join(taskDir, 'input');
  const executor = makeExecutor(workDir, skillName, skillRepoPath);

  // Build initial system prompt (progressive disclosure: description only)
  const skillMd = fs.readFileSync(path.join(skillRepoPath, 'SKILL.md'), 'utf8');
  const { frontmatter } = parseFrontmatter(skillMd);
  const toolNames = allowWrite
    ? 'list_skills, load_skill, list_dir, read_file, write_file, run_skill'
    : 'list_skills, load_skill, list_dir, read_file, run_skill';
  const systemPrompt = [
    'You are a coding agent operating in a sandboxed environment.',
    '',
    'CURRENT WORKING DIRECTORY (cwd): ' + workDir,
    'All relative paths in list_dir / read_file / write_file / run_skill args resolve against this cwd.',
    'Use "." to refer to the cwd itself.',
    '',
    'AVAILABLE SKILLS:',
    '- ' + skillName + ': ' + (frontmatter.description || '(no description)'),
    'To use a skill, first call list_skills (returns metadata), then load_skill (returns the full skill body with instructions). The skill body tells you exactly how to use the skill.',
    '',
    'TOOLS: ' + toolNames + '.',
    '- run_skill executes a sg-data-pack CLI subcommand (extract, validate, rules, diff, etc.). It runs in the cwd, so pass paths relative to cwd.',
    '- You CANNOT read the skill source or internal scripts directly; you operate the skill through its documented CLI and the load_skill body.',
    '',
    'Complete the task. Use the skill when it helps. When done, reply with a short summary of what you did.'
  ].join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: taskMd }
  ];
  const tools = buildTools(allowWrite);

  // Open trace file (ensure parent dir exists for arbitrary round tags)
  fs.mkdirSync(path.dirname(tracePath), { recursive: true });
  const traceStream = fs.createWriteStream(tracePath);
  function logTrace(entry) {
    traceStream.write(JSON.stringify(entry) + '\n');
  }

  logTrace({ t: Date.now(), type: 'task_start', task_dir: taskDir, skill_repo: skillRepoPath, work_dir: workDir });
  logTrace({ t: Date.now(), type: 'system_prompt', content: systemPrompt });
  logTrace({ t: Date.now(), type: 'user_message', content: taskMd });

  let finalAnswer = null;
  let steps = 0;
  let errorState = null;

  while (steps < maxSteps) {
    steps++;
    let resp;
    try {
      resp = chatComplete(mc, messages, tools);
    } catch (e) {
      errorState = 'api_error: ' + String(e.message || e);
      logTrace({ t: Date.now(), type: 'api_error', step: steps, error: errorState });
      break;
    }
    const choice = resp.choices && resp.choices[0];
    if (!choice) { errorState = 'no choices'; break; }
    const msg = choice.message;
    const finishReason = choice.finish_reason;

    // Record reasoning_content if present (GLM-5.2 reasoning model)
    if (msg.reasoning_content) {
      logTrace({ t: Date.now(), type: 'reasoning', step: steps, content: msg.reasoning_content });
    }

    const assistantMsg = { role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls || [] };
    messages.push(assistantMsg);
    logTrace({ t: Date.now(), type: 'assistant', step: steps, content: msg.content || '', tool_calls: msg.tool_calls || [], finish_reason: finishReason });

    // If there are tool calls, execute them
    if (msg.tool_calls && msg.tool_calls.length) {
      for (const tc of msg.tool_calls) {
        const fnName = tc.function.name;
        let fnArgs = {};
        try { fnArgs = JSON.parse(tc.function.arguments || '{}'); } catch (e) { fnArgs = {}; }
        const result = executor(fnName, fnArgs);
        const toolMsg = { role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) };
        messages.push(toolMsg);
        logTrace({ t: Date.now(), type: 'tool_call', step: steps, name: fnName, args: fnArgs, result });
      }
      continue; // next loop iteration
    }

    // No tool calls -> check if it's a final answer
    if (finishReason === 'stop' || (msg.content && msg.content.trim())) {
      finalAnswer = msg.content || '';
      logTrace({ t: Date.now(), type: 'final_answer', step: steps, content: finalAnswer });
      break;
    }

    // finish_reason length or otherwise, but no content and no tool calls -> stop
    if (finishReason === 'length') {
      // Model ran out of tokens mid-generation; nudge once
      if (steps < maxSteps) {
        messages.push({ role: 'user', content: 'You hit the token limit. Please continue and finish the task concisely.' });
        logTrace({ t: Date.now(), type: 'nudge', step: steps, reason: 'length' });
        continue;
      }
    }
    // Unknown state: break to avoid infinite loop
    break;
  }

  if (!finalAnswer && !errorState) {
    errorState = 'max_steps_reached';
    logTrace({ t: Date.now(), type: 'max_steps_reached', steps });
  }

  logTrace({ t: Date.now(), type: 'task_end', steps, final_answer: finalAnswer, error: errorState });
  traceStream.end();

  // Print summary to stdout for the orchestrator
  const summary = { task_dir: taskDir, steps, final_answer: finalAnswer, error: errorState, trace_path: tracePath };
  console.log(JSON.stringify(summary));
}

main();
