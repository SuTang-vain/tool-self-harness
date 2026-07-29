'use strict';
/*
 * trace.js - trace parsing + failure signature attribution for Tool Self-Harness
 *
 * A trace is a JSONL file produced by runner.js. Each line is an event:
 *   {type: "task_start"|"system_prompt"|"user_message"|"reasoning"|"assistant"|
 *    "tool_call"|"final_answer"|"api_error"|"max_steps_reached"|"task_end", ...}
 *
 * This module reads a trace + a verify result, and produces a failure signature:
 *   {
 *     terminal_cause:     why the task ultimately failed (verifier-grounded),
 *     agent_behavior:     what the agent did (or didn't do),
 *     implicated_surface: which skill surface the failure maps to,
 *     evidence:           excerpt from the trace supporting the attribution
 *   }
 *
 * Clustering is done by exact (terminal_cause, implicated_surface) agreement,
 * matching the paper's deterministic + evaluator-grounded clustering (§3.2).
 */

// ---------- heuristic surface attribution table ----------
// Maps (terminal_cause, agent_behavior) -> implicated_surface
const HEURISTICS = [
  // skill never loaded -> description surface failed to recruit
  {
    match: (sig) => sig.terminal_cause === 'no_pack_written' && !sig.loaded_skill,
    surface: 'skill-description',
    note: 'skill was never load_skill-ed; description failed to recruit'
  },
  // bypassed extract: agent hand-wrote data.json instead of using the extract pipeline (more specific, check first)
  {
    match: (sig) => sig.bypassed_extract && sig.terminal_cause === 'validate_failed',
    surface: 'workflow-section',
    note: 'agent bypassed extract and hand-wrote data.json; workflow must mandate extract-before-validate'
  },
  // skill loaded but extract never run -> workflow routing failed
  {
    match: (sig) => (sig.terminal_cause === 'no_pack_written' || sig.terminal_cause === 'validate_failed') && sig.loaded_skill && !sig.ran_extract,
    surface: 'workflow-section',
    note: 'skill loaded but extract subcommand never invoked; workflow routing unclear'
  },
  // extract run but exited non-zero before producing pack -> workflow/config guidance
  {
    match: (sig) => sig.terminal_cause === 'no_pack_written' && sig.ran_extract && sig.extract_exit !== 0,
    surface: 'workflow-section',
    note: 'extract ran but failed; config guidance may be unclear'
  },
  // provenance entirely missing: workflow should mandate provenance stamping
  {
    match: (sig) => sig.provenance_missing && sig.terminal_cause === 'validate_failed',
    surface: 'workflow-section',
    note: 'provenance field entirely missing from produced pack; workflow must mandate provenance stamping as a mandatory step'
  },
  // validate failed with E5/E7 (dangling refs) -> rule-cheat-sheet didn't warn enough
  {
    match: (sig) => sig.terminal_cause === 'validate_failed' && /E5|E7|E13/.test(sig.validate_errors || ''),
    surface: 'rule-cheat-sheet',
    note: 'validate failed on E5/E7/E13 (reference resolution); cheat-sheet warning insufficient'
  },
  // validate failed with other errors -> rule-cheat-sheet or workflow
  {
    match: (sig) => sig.terminal_cause === 'validate_failed',
    surface: 'rule-cheat-sheet',
    note: 'validate failed; rule coverage or cheat-sheet clarity may be the issue'
  },
  // wrong subcommand loop (called non-extract subcommands repeatedly)
  {
    match: (sig) => sig.terminal_cause === 'no_pack_written' && sig.wrong_subcommand_loop,
    surface: 'cli-section',
    note: 'agent looped on wrong subcommands; CLI routing unclear'
  },
  // equivalence failed -> workflow step-4 guidance
  {
    match: (sig) => sig.terminal_cause === 'equivalence_failed',
    surface: 'workflow-section',
    note: 'equivalence test failed; step-4 losslessness guidance may be insufficient'
  },
  // context bloat: many steps + repeated reference reads -> body too verbose
  {
    match: (sig) => sig.terminal_cause === 'max_steps_reached' && sig.steps > 15 && sig.ref_reads > 2,
    surface: 'core-concept',
    note: 'agent ran out of steps after excessive exploration; body may be too verbose'
  },
  // max steps reached, generic
  {
    match: (sig) => sig.terminal_cause === 'max_steps_reached',
    surface: 'workflow-section',
    note: 'agent hit max steps without completing; workflow may lack a decisive end-state'
  }
];

// ---------- parse a trace into a signature scaffold ----------
function parseTrace(tracePath) {
  const lines = require('fs').readFileSync(tracePath, 'utf8').split('\n').filter(Boolean);
  const events = lines.map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);

  const toolCalls = events.filter(e => e.type === 'tool_call');
  const runSkillCalls = toolCalls.filter(tc => tc.name === 'run_skill');
  const extractCalls = runSkillCalls.filter(tc => tc.args && tc.args.subcommand === 'extract');
  const validateCalls = runSkillCalls.filter(tc => tc.args && tc.args.subcommand === 'validate');
  const refReads = toolCalls.filter(tc => tc.name === 'read_file' && /references\//.test((tc.args && tc.args.path) || ''));

  const taskEnd = events.find(e => e.type === 'task_end') || {};
  const finalAnswer = events.find(e => e.type === 'final_answer');
  const apiErrors = events.filter(e => e.type === 'api_error');

  // Collect validate error messages from tool results
  let validateErrors = '';
  for (const vc of validateCalls) {
    if (vc.result && vc.result.stderr) validateErrors += vc.result.stderr + '\n';
    if (vc.result && vc.result.stdout) validateErrors += vc.result.stdout + '\n';
  }
  // Collect extract outputs
  let extractExit = null;
  let extractStderr = '';
  for (const ec of extractCalls) {
    if (ec.result && ec.result.exit_code != null) extractExit = ec.result.exit_code;
    if (ec.result && ec.result.stderr) extractStderr += ec.result.stderr + '\n';
  }

  // Detect wrong-subcommand loop: called run_skill with non-extract subcommands >2 times without extract
  const nonExtractRunSkill = runSkillCalls.filter(tc => !(tc.args && tc.args.subcommand === 'extract'));
  const wrongSubcommandLoop = nonExtractRunSkill.length > 2 && extractCalls.length === 0;

  // Detect bypassed-extract: model wrote data.json directly via write_file without running extract
  const writeFileCalls = toolCalls.filter(tc => tc.name === 'write_file');
  const wroteDataJson = writeFileCalls.some(tc => /data\.json/i.test((tc.args && tc.args.path) || ''));

  return {
    events,
    steps: toolCalls.length,
    loaded_skill: toolCalls.some(tc => tc.name === 'load_skill'),
    ran_extract: extractCalls.length > 0,
    ran_validate: validateCalls.length > 0,
    extract_exit: extractExit,
    extract_stderr: extractStderr,
    validate_errors: validateErrors,
    ref_reads: refReads.length,
    wrong_subcommand_loop: wrongSubcommandLoop,
    bypassed_extract: wroteDataJson && extractCalls.length === 0,
    final_answer: finalAnswer ? finalAnswer.content : null,
    api_errors: apiErrors.length,
    max_steps: taskEnd.error === 'max_steps_reached',
    task_end_error: taskEnd.error || null
  };
}

// ---------- determine terminal cause (verifier-grounded) ----------
function terminalCause(parsed, verifyStatus) {
  if (verifyStatus === 'pass') return 'pass';
  if (parsed.task_end_error && parsed.task_end_error.startsWith('api_error')) return 'api_error';
  if (parsed.max_steps) return 'max_steps_reached';
  // Check verify outcomes in order
  if (/equivalence/i.test(parsed.extract_stderr)) return 'equivalence_failed';
  if (parsed.ran_validate && parsed.validate_errors) return 'validate_failed';
  if (!parsed.ran_extract) {
    if (!parsed.loaded_skill) return 'no_pack_written';  // skill never engaged
    return 'no_pack_written';
  }
  if (parsed.extract_exit !== 0) return 'no_pack_written';  // extract failed
  return 'no_pack_written';  // ran but produced no valid pack
}

// ---------- attribute to a surface ----------
function attributeSurface(sig) {
  for (const h of HEURISTICS) {
    if (h.match(sig)) {
      return { surface: h.surface, note: h.note };
    }
  }
  // default
  return { surface: 'skill-description', note: 'unattributed failure; defaulting to description' };
}

// ---------- build a failure signature ----------
// producedPackPath (optional): path to the model's produced data.json, used to
// detect provenance-missing failures (which should attribute to workflow-section,
// not rule-cheat-sheet, since the workflow should mandate provenance stamping).
function buildSignature(tracePath, verifyStatus, producedPackPath) {
  const parsed = parseTrace(tracePath);
  const tc = terminalCause(parsed, verifyStatus);

  if (tc === 'pass') {
    return { passed: true, terminal_cause: 'pass', implicated_surface: null, agent_behavior: null, evidence: null, parsed };
  }

  // Check if the produced pack is missing provenance entirely
  let provenanceMissing = false;
  if (producedPackPath) {
    try {
      const pack = JSON.parse(require('fs').readFileSync(producedPackPath, 'utf8'));
      provenanceMissing = !pack.provenance || Object.keys(pack.provenance).length === 0;
    } catch (e) { /* ignore */ }
  }
  parsed.provenance_missing = provenanceMissing;

  const sig = Object.assign({}, parsed, { terminal_cause: tc });
  const attr = attributeSurface(sig);

  // Pick a representative evidence excerpt
  let evidence = '';
  const lastTool = parsed.events.filter(e => e.type === 'tool_call').slice(-3);
  for (const tc of lastTool) {
    evidence += '[' + tc.name + ' ' + JSON.stringify(tc.args).slice(0, 80) + '] -> ' +
      (tc.result && tc.result.exit_code != null ? 'exit ' + tc.result.exit_code : tc.result && tc.result.error ? 'error' : 'ok') + '\n';
  }
  if (parsed.validate_errors) evidence += 'VALIDATE: ' + parsed.validate_errors.slice(0, 200) + '\n';

  return {
    passed: false,
    terminal_cause: tc,
    agent_behavior: describeBehavior(parsed),
    implicated_surface: attr.surface,
    attribution_note: attr.note,
    evidence: evidence.trim(),
    steps: parsed.steps,
    parsed
  };
}

function describeBehavior(parsed) {
  const parts = [];
  if (!parsed.loaded_skill) parts.push('skipped-load-skill');
  else parts.push('loaded-skill');
  if (parsed.wrong_subcommand_loop) parts.push('wrong-subcommand-loop');
  if (parsed.bypassed_extract) parts.push('bypassed-extract(hand-wrote-data.json)');
  if (parsed.ran_extract) parts.push('ran-extract(exit=' + parsed.extract_exit + ')');
  else parts.push('no-extract');
  if (parsed.ran_validate) parts.push('ran-validate');
  if (parsed.ref_reads > 2) parts.push('excessive-ref-reads(' + parsed.ref_reads + ')');
  if (parsed.max_steps) parts.push('hit-max-steps');
  return parts.join(', ');
}

module.exports = { parseTrace, buildSignature, terminalCause, attributeSurface };
