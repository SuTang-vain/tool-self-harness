# Tool-Side Harness Research Charter

Status: redirected and frozen as the active research direction on 2026-07-30.

Source framing: the aligned paper and research outlines titled *Tool-Side Harness for
Progressive Tool Structures: Taxonomy, 4D Baseline Modeling, and Self-Evolution for Skills, MCP,
and CLI Guidance*. Their alignment and empirical corrections are recorded in
`experiments/tool-side-harness/OUTLINE_ALIGNMENT.md`.

## Core thesis

A tool-side harness is the local semantic adaptation layer that helps a model select, understand,
and correctly operate a Skill, MCP interface, or CLI workflow. It may be expressed through
frontmatter descriptions, Markdown instructions, schemas, prompts, command help, deep references,
or sub-tools. It must therefore be studied as a progressive structure rather than as one undifferentiated
prompt.

The project is no longer organized around the broad claim that Self-Harness generally improves a
skill. Its primary objective is to explain and test **which bounded change, on which surface, for
which tool structure, moves which outcome dimension, and with what non-local cost**.

## Research questions

- **RQ1 — Taxonomy:** Can common tool-side harnesses be classified by dominant task structure and
  failure signature?
- **RQ2 — Fitting paths:** Do four bounded fitting paths explain the useful and harmful effects of
  local Markdown, prompt, schema, and workflow edits?
- **RQ3 — 4D drift:** Can each edit be represented as a measurable change in correctness,
  reliability, efficiency, and human utility without hiding regressions in a weighted score?
- **RQ4 — Progressive evolution:** Does single-surface attribution and patching, followed by a
  cascaded gate and lineage update, yield safer evolution than aggregate or unrestricted editing?

## Taxonomy under test

| Harness class | Dominant structure | Expected failure modes | Primary fitting path |
|---|---|---|---|
| Atomic transform / validation | explicit input-output contract | schema ambiguity, field fabrication, output drift | Path A: interface constraints and assertion hardening |
| Multi-step workflow | ordered commands and state transitions | skipped preconditions, state confusion, blind retry | Path B: state transition and recovery protocol |
| Knowledge-rule / policy | dense conditional guidance | rule conflict, attention dilution, hallucinated exceptions | Path C: constraint-density control and pruning |
| Resource / event-stream interaction | dynamic tools, resources, prompts, events | discovery failure, boundary spillover, context inflation | Path D: progressive exposure and context reduction |

These classes and paths are hypotheses, not established universal categories. They become paper
claims only after the registered sample pool contains representative systems and replicated
failure signatures from more than one implementation per claimed class.

## Progressive structure and editable surfaces

The default structure is:

```text
Level 0: frontmatter / trigger description
    -> Level 1: main instructions, schema guidance, workflow rules
        -> Level 2: deep references, scripts, templates, resources, sub-tools
```

Every proposal must declare exactly one `surface_id`, one level, one fitting path, and one intended
parameter movement. Cross-surface edits are separate ablations and cannot enter the primary
lineage as if they were local patches.

The initial parameterization is:

- `P_schema`: schema and contract strictness;
- `P_order`: workflow ordering and recovery rigidity;
- `P_density`: rule and constraint density;
- `P_prune`: removal or deferred loading of low-value context.

Directional effects of these parameters are preregistered hypotheses, not monotonic laws. In
particular, the completed expanded MCP studies show that increasing `P_schema` can reduce Q2 on
unrelated task families; neither `P_schema` nor `P_prune` is treated as universally low risk.

## Four-dimensional outcome vector

For baseline or candidate `h`, report:

```text
V(h) = [Q1 correctness, Q2 reliability, Q3 efficiency, Q4 human utility]
```

The dimensions are not summed into a primary weighted score.

### Q1 — Correctness

Verifier-defined task completion, reported by split, task family, and attempt. Aggregate pass
movement is evidence about Q1 only.

### Q2 — Reliability

Per-task success across fresh repeats, non-regression of the reliable task set, task exchange,
and critical verifier regressions. Q2 is the hard capability-evolution gate.

### Q3 — Efficiency

Prompt/completion/total tokens, API and tool calls, retries, latency, and normalized cost per
successful attempt or reliable task. Q3 is interpreted only after Q1/Q2 are non-regressive unless
a separately labeled efficiency-only study was preregistered.

### Q4 — Human utility

Preference, clarification burden, user correction/takeover, completion time, perceived control,
and maintainability. Q4 requires a separate human or expert protocol; verifier outcomes are not a
proxy for it.

## Cascaded gate

### Gate 0 — Protocol integrity

Abort rather than score provider, API, infrastructure, leakage, or verifier-integrity failures.
Held-out evidence remains hidden from proposal generation.

### Gate 1 — Q2 reliable non-regression

Use the frozen `reliable-task-set-v1` rule:

- gain at least one reliable task for a capability promotion;
- lose no previously reliable task on either split;
- do not decrease held-in or held-out aggregate pass count;
- introduce no critical verifier regression.

A structural or efficiency candidate that gains no reliable task may proceed only in a separately
preregistered non-capability track and must preserve all reliable tasks and aggregates.

### Gate 2 — Q1 classification

After Q2 passes, classify the change as a local capability gain, distribution-replicated gain, or
no capability change. Aggregate gains that fail Q2 are task exchanges, not evolution.

### Gate 3 — Q3 efficiency

Compare preregistered efficiency measures. Efficiency cannot compensate for a Q1/Q2 regression.

### Gate 4 — Q4 human utility

Run only under a separate preregistered human/expert evaluation. Human preference cannot erase a
critical correctness or reliability regression.

## Evolution loop

1. **Attribution:** map a held-in failure signature to Level 0, 1, or 2 and to one fitting path.
2. **Proposal:** create a bounded patch on one registered surface; state expected Q1-Q4 movement
   and regression mechanism before evaluation.
3. **Gate:** run at least three fresh repeats on the complete frozen held-in and held-out suite and
   apply Gates 0-4 in order.
4. **Lineage:** promote only a passing patch. Record rejected patches, task exchanges, and affected
   families in the attention-conflict matrix.

## Evidence and claim levels

- **E0 — Observation:** a failure signature or aggregate movement in one run.
- **E1 — Local path effect:** a bounded patch produces a repeatable 4D movement on one model and
  one frozen suite; it need not be a promotion.
- **E2 — Reliable local evolution:** Gate 1 passes on one model and one frozen suite.
- **E3 — Replicated path effect:** the direction and mechanism replicate across an independent
  task distribution or model.
- **E4 — Taxonomy-level claim:** the fitting-path prediction holds across representative systems
  in the relevant class, with registered counterexamples and boundary conditions.
- **E5 — Product utility claim:** E3/E4 evidence plus preregistered Q3 and Q4 benefit without
  Q1/Q2 regression.

Use the narrowest supported level. “Better” is prohibited unless the dimension and claim level are
specified.

## Current evidence under the redirected framing

1. The compact GLM MCP edit is an **E2 local Path-A evolution** on the original 12-task suite.
2. MiniMax and DeepSeek reject model transfer of that edit; it is not a model-general promotion.
3. Two independent expanded GLM evaluations reject promotion and expose task exchange and
   non-local regressions. This is **E3 mechanism evidence about Path-A over-constraint risk**, not
   evidence of a generally better MCP harness.
4. The targeted description/body/checklist ablation shows that surface placement changes the
   4D outcome, but no tested variant is non-regressive. It is diagnostic E1 evidence only.
5. The systematic-debugging pilot is outcome-flat and does not yet qualify as a process-sensitive
   Path-B/C benchmark.
6. No current experiment establishes the four-class taxonomy, Path B/C/D effectiveness, or Q4.

## Active work packages

- **WP1 — Taxonomy inventory:** freeze a labeled sample pool spanning Skill, MCP, and CLI forms.
- **WP2 — 4D baseline calibration:** measure baseline vectors and verify that each benchmark is
  sensitive to its intended failure signatures.
- **WP3 — Progressive evolution prototypes:** run registered single-surface loops on 2-3 qualified
  representative targets.
- **WP4 — Method ablations:** compare Q2/no-Q2, bounded/unrestricted patches, local/deep-reference
  changes, and lineage/no-lineage reporting.
- **WP5 — Replication and utility:** expand models and distributions only after a local path effect
  is stable; defer Q4 until the capability protocol is mature.

The executable research program, registries, and protocol links live in
`experiments/tool-side-harness/README.md`.
