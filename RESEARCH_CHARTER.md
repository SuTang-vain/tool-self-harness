# Tool-Side Harness Research Charter

Status: category-conditioned research direction formally established on 2026-08-03.

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

## Research questions — formally established 2026-08-03

The active study is now organized around **category-conditioned Self-Harness evolution**. The
four questions are hierarchical: RQ1 establishes whether target heterogeneity exists; RQ2 tests
whether that heterogeneity tracks structural category; RQ3 tests candidate mechanisms; and RQ4
asks whether the pattern replicates. The questions are deliberately narrower than a universal
claim that Self-Harness improves skills.

- **RQ1 — Target heterogeneity:** Do Self-Harness outcomes differ materially across target skills?
  The primary outcomes are promotion rate, per-task stable gains/losses, task exchange, held-out
  regression, and Q3 movement under the same frozen protocol.
- **RQ2 — Category association:** Are promotion rate, stable gains, and task exchange systematically
  associated with the structural category of the target skill?
- **RQ3 — Structural mechanisms:** Do rule density, reference depth, verifier observability, task
  coupling, and edit locality explain or mediate the observed category differences?
- **RQ4 — Replication:** Does the category-conditioned pattern replicate across independent targets
  and, after the current GLM-only phase, across models?

The earlier taxonomy, fitting-path, 4D, and progressive-evolution questions remain supporting
method questions. They are not discarded; they are now operational subquestions used to answer
RQ1-RQ4.

## Taxonomy under test

| Harness class | Dominant structure | Expected failure modes | Primary fitting path |
|---|---|---|---|
| Atomic transform / validation | explicit input-output contract | schema ambiguity, field fabrication, output drift | Path A: interface constraints and assertion hardening |
| Multi-step workflow | ordered commands and state transitions | skipped preconditions, state confusion, blind retry | Path B: state transition and recovery protocol |
| Knowledge-rule / policy | dense conditional guidance | rule conflict, attention dilution, hallucinated exceptions | Path C: constraint-density control and pruning |
| Resource / event-stream interaction | dynamic tools, resources, prompts, events | discovery failure, boundary spillover, context inflation | Path D: progressive exposure and context reduction |
| Debugging / diagnosis | reproduce, localize, fix, guard, verify | edit-before-reproduce, symptom fixing, missing regression guard, incomplete verification | Path B/C: state recovery and process/rule ordering |

These classes and paths are hypotheses, not established universal categories. They become paper
claims only after the registered sample pool contains representative systems and replicated
failure signatures from more than one implementation per claimed class.

### Category-conditioned interpretation boundary

A target is the unit of analysis for category claims; tasks and attempts are nested observations,
not independent category replicates. Categories are multi-label structural annotations with a
registered primary category and secondary features. Market popularity is used only to construct a
sampling frame, never as an explanatory variable. The current GLM-only phase can establish RQ1
and provide exploratory RQ2/RQ3 evidence, but cannot establish RQ4 across models.

The minimum claim discipline is:

- one target: local target observation only;
- two qualified targets in a category: exploratory within-category comparison;
- three qualified targets in a category plus an independent replication: stronger category-level
  claim, still bounded by model and endpoint;
- cross-model evidence is deferred until the GLM target-by-category map is stable.

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

## Current evidence under the category-conditioned framing

1. **RQ1 has initial support at target level.** The workflow target
   `using-git-worktrees` has an E2 replicated expanded local evolution result, while the MCP and
   Security Review targets show different boundaries and task-exchange behavior.
2. **Path B is a direct positive local-evolution anchor.** Within GLM-5.2 and the frozen
   `using-git-worktrees` distribution, a bounded L1 edit increased the reliable task set from 8/12
   to 12/12 with no reliable loss and held-out gains.
3. **Path C is a qualification/safety boundary, not a failed Self-Harness run.** The Security
   Review formal baseline had held-in movement, deep-reference sensitivity, and unchanged held-out
   aggregate counts, but per-task identity exchange caused the Q2 stop before h0 freeze and
   candidate generation.
4. **RQ2 is not yet established.** The observed B-versus-C contrast is consistent with a
   workflow/state-transition target being more locally patchable than a dense knowledge-rule target,
   but there are too few independent targets and a model/endpoint confound remains.
5. **RQ3 is a preregistered mechanism hypothesis.** Rule density, reference depth, verifier
   observability, task coupling, and edit locality must be measured before causal language is used.
6. **The debugging diagnostic adds a process-sensitive boundary.** Official-full raises
   test-before-first-edit to 9/9 attempts versus 7/9 minimal and 6/9 no-skill, but all variants
   pass the same task vector; minimal reaches the held-in ceiling, so the suite stops at redesign.
7. **RQ4 is not measured.** GLM-5.2 is the only active model; cross-model expansion remains
   deferred until the category-balanced GLM sample is qualified.

## Active work packages

- **WP1 — Category-balanced inventory:** freeze a licensed sample pool with at least two candidate
  targets per category where feasible, while preserving the historical v1 registry unchanged.
- **WP2 — Structural coding:** assign primary/secondary categories and the preregistered feature
  vector before observing new evolution outcomes.
- **WP3 — Baseline qualification:** run diagnostic and formal no-skill/minimal/official-full
  comparisons; stop on verifier, ceiling/floor, or missing variant separation.
- **WP4 — Category-conditioned evolution:** run one bounded single-surface lineage per qualified
  target, with per-task stable acceptance and hidden held-out tasks.
- **WP5 — Mechanism and replication:** preselect surface-placement/ablation contrasts, then add
  independent targets within categories before any cross-model RQ4 study.
- **WP6 — Q3/Q4 boundaries:** report usage descriptively after Q1/Q2; keep Q4 `not_measured` until
  an independent human/expert protocol is preregistered.

The executable research program, registries, and protocol links live in
`experiments/tool-side-harness/README.md`.
