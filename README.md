# Tool Self-Harness

An implementation of the **Self-Harness** paradigm for tool-side harnesses
(skills / MCP tools), based on the paper *"Self-Harness: Harnesses That Improve
Themselves"*.

Self-Harness enables a fixed LLM to improve the very harness (here: a skill's
`SKILL.md`) through which it operates, **without human engineering or a stronger
external agent**. It runs an iterative loop with three stages:

1. **Weakness Mining** — run the current harness on a set of tasks, cluster
   failed execution traces into failure signatures (verifier-grounded).
2. **Harness Proposal** — the same model, in a proposer role, generates K
   diverse yet minimal candidate edits, each bound to one editable surface.
3. **Proposal Validation** — regression-test each candidate on held-in + held-out
   splits; accept only if it improves ≥1 split without degrading the other.

The first target is the `sg-data-pack` skill, but the harness is target-agnostic:
swap `config.yaml` + `surfaces.yaml` + `tasks/` to retarget it.

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

### Acceptance rule (`scripts/05-accept.js`)

```
accept(j) iff (P_in(j) > P_in(h_t)  AND  P_ho(j) >= P_ho(h_t))
         OR   (P_ho(j) > P_ho(h_t)  AND  P_in(j) >= P_in(h_t))
```

Pure trade-offs are rejected. Accepted edits merge into the sandbox as a git
commit tagged `h<N>` in `lineage/`. Rejected edits are logged but do not change
the harness. The target skill repo (`~/DEV/sg-data-pack`) is **read-only** —
only the `sandbox/` copy is ever edited.

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
stable acceptance, and rejection of legacy aggregate-only result records.

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

## Status

- ✅ End-to-end loop runs, produces trace/evidence/proposals/results/lineage.
- ✅ t01 confirmed solvable by the baseline harness (non-zero baseline).
- ✅ All 5 expected packs pass their verifiers.
- ✅ Per-task acceptance metadata and stability gate implemented; clean reruns of round-1/m3-2/ds-3/ds-4 accepted 0/8 candidates.
- ⚠ MCP tool support not yet implemented (skill-only).
- ⚠ references/scripts not yet editable surfaces (SKILL.md only).

## Reference

Self-Harness paradigm: *"Self-Harness: Harnesses That Improve Themselves"*.
The three-stage loop (Weakness Mining → Harness Proposal → Proposal Validation)
and the non-regressive acceptance rule are direct implementations of §3.2-3.4.
