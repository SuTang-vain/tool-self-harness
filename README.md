# Tool-Side Harness Research

This repository studies **tool-side harnesses**: the local descriptions, Markdown rules, schemas,
workflow guidance, and deep resources through which models operate Skills, MCP systems, and CLI
workflows. The active research program is organized around:

1. a taxonomy of tool structures and failure signatures;
2. four fitting paths for bounded harness changes;
3. a four-dimensional outcome vector—correctness, reliability, efficiency, and human utility;
4. a progressive evolution loop using one-surface patches, Q2-first gating, and lineage/conflict
   records.

The repository began as a reproduction and extension of *Self-Harness: Harnesses That Improve
Themselves*. That implementation and its historical experiments remain available, but the project
no longer assumes that Self-Harness generally improves a skill. Current results show a compact
GLM MCP gain that fails cross-model transfer and two expanded-distribution evaluations. These
positive and negative results now motivate a narrower question: **which local intervention helps
which tool structure, on which outcome dimension, and at what non-local cost?**

Start with [`RESEARCH_CHARTER.md`](RESEARCH_CHARTER.md) and
[`experiments/tool-side-harness/README.md`](experiments/tool-side-harness/README.md). The earlier
general-skill studies are preserved under `experiments/general-skills/` as Stage-0 evidence.

## Quick start

```bash
cd ~/DEV/tool-self-harness

# Ensure the sandbox has a fresh copy of the target skill
rm -rf sandbox && cp -r ~/DEV/sg-data-pack sandbox

# Run the full loop (3 rounds by default)
bash scripts/loop.sh config.yaml 3
```

Each round produces:
- `runs/round-N/<task>/trace.jsonl` — per-task execution trace
- `runs/round-N/results.json` — per-task verify status
- `evidence/round-N.json` — clustered failure patterns
- `proposals/round-N/<j>/{patch.json,audit.json}` — candidate edits
- `results/round-N.json` + `results/round-N-accept.json` — validation + accept/reject
- `lineage/h<N>` — git commit hash of each accepted harness version

## Architecture

```
01-run-round ──► 02-mine-weakness ──► 03-propose ──► 04-validate ──► 05-accept
(run tasks)      (cluster failures)   (K edits)      (regression)    (merge/reject)
```

### Headless runner (`scripts/lib/runner.js`)

A ~300-line Node script that calls the model via an OpenAI-compatible endpoint
and drives a tool loop. It faithfully simulates **progressive disclosure**:

- The initial system prompt contains ONLY the skill's frontmatter `description`
  (what `list_skills()` returns). The body is NOT loaded.
- Tools: `list_skills`, `load_skill` (returns the SKILL.md body), `list_dir`,
  `read_file`, `write_file` (sandboxed to the task cwd), `run_skill` (executes
  a skill CLI subcommand).
- This makes the `skill-description` surface testable: if the description is
  bad, the model never calls `load_skill` and fails — a failure Weakness Mining
  attributes to `skill-description`.

The model config is read from `~/.zcode/v2/config.json` (the same providers
ZCode uses), so the "self" in Self-Harness is genuinely the same model that
operates the skill in production.

### Failure signatures (`scripts/lib/trace.js`)

Each failed task gets a signature `(terminal_cause, implicated_surface)`:

| terminal_cause | meaning |
|---|---|
| `validate_failed` | the produced pack failed E1-E16 validation |
| `equivalence_failed` | the losslessness test failed |
| `no_pack_written` | the agent never produced a data.json |
| `max_steps_reached` | the agent looped without finishing |
| `api_error` | a model/endpoint error |

`implicated_surface` is attributed heuristically from the trace (e.g.
`skill_not_invoked` + never-called-`load_skill` → `skill-description`).
Clustering is by **exact** `(terminal_cause, implicated_surface)` agreement —
deterministic and evaluator-grounded, matching the paper §3.2.

### Editable surfaces (`surfaces.yaml`)

Each proposal must bind to exactly ONE surface and may only modify that
surface's bytes (enforced by `patch.js` using heading boundaries). This is the
paper's **minimality** constraint (§3.3). Current surfaces for sg-data-pack:
`skill-description`, `core-concept`, `cli-section`, `workflow-section`,
`rule-cheat-sheet`, `crawl-pipeline-contract`, `deep-references`.

### Capability acceptance rule (`scripts/05-accept.js`)

The historical aggregate gate is still reported for comparison, but it cannot promote a lineage.
The active Q2 rule is `reliable-task-set-v1`: a task is reliable only if it passes every fresh
repeat, and a capability candidate must gain at least one reliable task, lose none, and avoid
held-in/held-out aggregate or critical-verifier regression. This prevents variance-based false
acceptance and task exchange.

Accepted edits merge into the sandbox as a git commit tagged `h<N>` in `lineage/`. Rejected edits
are logged but do not change the harness. The target skill repo (`~/DEV/sg-data-pack`) is
**read-only**—only the `sandbox/` copy is edited. New progressive studies additionally validate a
one-surface candidate manifest with `scripts/11-validate-progressive-candidate.js`.

## Tasks

Five synthetic component libraries (small, deterministic, fast):

| Task | Split | Pattern | Tests |
|---|---|---|---|
| `t01-id-based` | held-in | id-based graph | trigger + workflow + extract |
| `t02-chinese-alias` | held-in | Chinese-name-reference | alias table (E4/E5) |
| `t03-multi-stage` | held-in | multi-stage + scope | E12 disambiguation |
| `t04-external-json` | held-out | external JSON block | generalization |
| `t05-collection` | held-out | collection / templatize | generalization |

Each task has `task.md` (instructions), `input/` (the library to extract),
`expected/data.json` (ground-truth pack), and `verify.sh` (deterministic
grader: `validate` + semantic field comparison).

## Tests

Run the pure acceptance-rule regression tests with Node's built-in test runner:

```bash
node --test tests/acceptance.test.js
```

The tests cover stable task-pass computation, unstable held-in/held-out improvements,
stable acceptance, rejection of legacy aggregate-only records, and the generic reliable
task-set promotion gate. Run all protocol regression tests with:

```bash
node --test tests/acceptance.test.js tests/generic-acceptance.test.js tests/progressive-candidate.test.js
```

The progressive-candidate tests enforce one-surface scope, held-out hiding, formal repeat counts,
and prospective freeze metadata.

## Retargeting

To apply Self-Harness to a different skill:

1. Edit `config.yaml` → point `target.skill_repo` at the new skill, set
   `model.provider_id` to the desired model.
2. Edit `surfaces.yaml` → declare the new skill's editable surfaces.
3. Populate `tasks/held-in/` and `tasks/held-out/` with tasks + verifiers for
   that skill.
4. `bash scripts/loop.sh`.

For MCP tools, the loop is identical; only the runner's tool surface changes
(MCP tool descriptions become editable surfaces). Add `target.kind: mcp`
handling in `runner.js` (future work).

## Research Direction

The active framework treats Skill, MCP, and CLI harnesses as progressive structures:

```text
L0 trigger/description -> L1 main rules/schema/workflow -> L2 references/scripts/resources
```

Four candidate fitting paths are tested: interface constraints (A), state/recovery protocols (B),
constraint-density pruning (C), and progressive exposure (D). Every result is reported as
`[Q1 correctness, Q2 reliability, Q3 efficiency, Q4 human utility]`; these dimensions are not
collapsed into a primary weighted score. Q2 remains the hard capability gate, while Q4 is
`not_measured` until a separate human/expert protocol exists.

The two source research outlines and the empirical corrections applied to them are reconciled in
[`experiments/tool-side-harness/OUTLINE_ALIGNMENT.md`](experiments/tool-side-harness/OUTLINE_ALIGNMENT.md).

## Status

- ✅ End-to-end loop runs, produces trace/evidence/proposals/results/lineage.
- ✅ t01 confirmed solvable by the baseline harness (non-zero baseline).
- ✅ All 5 expected packs pass their verifiers.
- ✅ Per-task acceptance metadata and stability gate implemented; clean reruns of round-1/m3-2/ds-3/ds-4 accepted 0/8 candidates.
- ✅ MCP Builder prospective comparison completed: paper gate accepted 21/24→23/24 held-in with held-out flat, but reliable promotion rejected one lost 3/3 task.
- ✅ Final generic-skill promotion rule frozen as `reliable-task-set-v1`.
- ✅ MCP Builder Round 1 produced `h1-stable`: 24/24 held-in, 6/12 held-out, no lost reliable task; redundant combinations were rejected.
- ⚠ Systematic-debugging pilot was outcome-flat across no/minimal/full skill (14/16 held-in, 6/8 held-out); benchmark revision is required before Self-Harness proposals.
- ⚠ MCP `h1-stable` is model-specific: reliable for GLM on the compact suite, rejected for MiniMax/DeepSeek, and rejected on the expanded GLM suite.
- ✅ Research direction re-anchored around layered correctness, reliability, efficiency, and human-utility objectives.
- ✅ Independent expanded GLM replication completed: h1 again rejected on held-out/reliable non-regression.
- ✅ Targeted four-task edit ablation completed; no alternative edit was non-regressive on all diagnostic tasks.
- ✅ Research redirected to the Tool-Side Harness taxonomy + 4D baseline + progressive evolution program.
- ✅ Sample/evidence/conflict registries and the progressive single-surface manifest validator are in place.
- ⏳ Next formal step: qualify a multi-form sample pool and calibrate benchmark-sensitive baselines before new broad evolution claims.
- ⚠ MCP tool support not yet implemented (skill-only).
- ⚠ references/scripts not yet editable surfaces (SKILL.md only).

## Reference

Self-Harness paradigm: *"Self-Harness: Harnesses That Improve Themselves"*.
The three-stage loop (Weakness Mining → Harness Proposal → Proposal Validation)
and the non-regressive acceptance rule are direct implementations of §3.2-3.4.
