# Harnessing the Harness: Bounded Self-Evolution Applied to the DeepSeek Harness, and the Prior-Distance Mechanism That Predicts It

**Status:** Paper draft v1 (2026-08-14). All numbers cite frozen records under
`experiments/tool-side-harness/`; claim levels follow the charter
(`RESEARCH_CHARTER.md`). This draft is the consolidation artifact of the DSH
self-target research program, not a new experiment.

---

## Abstract

We apply the Self-Harness paradigm to a harness that hosts the research itself:
the DeepSeek Harness (DSH) — its agent presets and skills were registered as
tool-side harness targets and driven through the full qualification and
evolution pipeline. Two DSH targets reached formal baselines with discriminating
gradients on all four partitions. A preregistered degraded-baseline capability
track produced a promoted single-surface edit (a −44% condensed realm-rule
section) that recovered the degraded capability and replicated locally. The
efficiency track exposed a hard measurement boundary: at 15-attempt granularity,
even a 27% content edit's Q3 effect is below the noise floor (a −16% observation
failed to replicate and was retracted). Cross-repository replication of the
capability intervention did NOT transfer, motivating the central mechanism of
this paper: **causal effect size scales with the distance between harness
content and model priors.** We make this mechanism a direct measurement — a
no-harness single-shot probe battery (guessability G) calibrated against
measured effect sizes (6/8 consistent pairs on GLM; 4/4 within-model on
DeepSeek V4), with identified boundary conditions (multi-item dilution,
exact-phrase paraphrase). The first cross-model run (GLM → DeepSeek V4)
replicates gradient directions on all four partitions and shows that prior
floors are measurable and model-specific. The protocol now serves as a
pre-pilot gate: a screening of the next candidate target produced a targeted
design with frozen effect predictions. Claim discipline is maintained
throughout: the strongest claims are E2 (local, bounded) and E3 (directional
cross-model); nothing is overstated.

## 1. Introduction and Research Questions

Tool-side harnesses — the local descriptions, schemas, and workflow guidance
through which models operate skills, compositions, and CLIs — are the unit of
study (`RESEARCH_CHARTER.md`). The charter poses four hierarchical questions:

- **RQ1** Do Self-Harness outcomes differ materially across targets?
- **RQ2** Are promotion, stable gains, and task exchange associated with the
  structural category of the target?
- **RQ3** Do rule density, reference depth, verifier observability, task
  coupling, and edit locality explain the category differences?
- **RQ4** Does the pattern replicate across models?

This paper reports the DSH self-target program: the first time a harness
hosting the research program is itself the target ("harness studying harness"),
plus the mechanism (prior distance) and measurement tooling that emerged.

## 2. Method

### 2.1 Targets and qualification pipeline

- `editing-cordis-compositions` (knowledge-rule-policy, Path C-density-pruning),
  shipped inside the cordis preset of the DeepSeek Harness;
- `headless-preset` (atomic-validation, Path A-interface-constraint), a runnable
  DSH composition (L0 = preset.yml description, L1 = rows);
- `wcag-audit-patterns` (knowledge-rule-policy, independent repository) — the
  third Path C data point;
- `git-workflow-and-versioning` (workflow-state-transition, independent
  repository) — the Path B breadth attempt.

Pipeline: frozen suites (3–6 tasks per target, held-in/held-out), deterministic
graders, agent-facing contract checkers, three variants
(no-harness/minimal/official-full), 3 fresh repeats, a hardened runner
(workspace-isolated `run_command`; §2.2), Gate 0 aborts, Q2 reliable-task-set
hard gate, held-out hiding.

### 2.2 Runner integrity

Escape auditing found agents reading reference/grader files outside the
workspace through unrestricted shells (38 confirmed accesses; one
`$HOME`-variable-assembly evasion). The runner now refuses home expansion,
parent traversal, and outside absolute paths. Held-out hiding is a runner
property, not a prompt property (`rounds/dsh-pilot-v3/integrity-finding`).

### 2.3 Fixture-authoring discipline (D1–D5)

Task text must not contain the fix; tasks must direct harness consultation;
checkers must not create feedback traps; discriminating tasks need measurable,
non-saturated dose-responses; graders may only demand what the harness teaches
(`protocols/FIXTURE_AUTHORING_DISCIPLINE_V1.md`).

## 3. Results

### 3.1 Formal baselines (RQ1 — target heterogeneity)

| Target | official-full | minimal | no-harness |
|---|---|---|---|
| editing held-in / held-out | 9/9 + 6/6 | 3/9 + 3/6 | 3/9 + 3/6 |
| headless held-in / held-out | 9/9 + 6/6 | 3/9 + 0/6 | 3/9 + 0/6 |
| wcag held-in / held-out | 11/12 + 4/6 | 8/12 + 4/6 | 8/12 + 3/6 |
| git-workflow | — | — | — (terminated, §3.4) |

Non-saturated dose-response anchors: ec-01, ec-03, hp-01, hp-03 (3/3→0/3→0/3),
hp-04/hp-05 (6/6→0/6→1/6, GLM), wc-01 (2/3→1/3→0/3). Four targets produced
four outcomes (qualified, qualified, qualified, terminated) — direct RQ1
evidence of target heterogeneity.

### 3.2 Capability evolution under a degraded baseline (E2)

Natural h0 was at the capability ceiling, so the capability track was reopened
through a preregistered degradation: removing the realm-rule section collapsed
editing from 9/9 + 6/6 to 3/9 + 3/6 (reliable set {ec-02, ec-07}); a verbatim
restore recovered everything (mechanism control), and a **−44% condensed
rewrite** (delegation template + four rule sentences) also recovered everything
and passed the Q2 gate (+3 reliable tasks, zero lost) → promoted to
`lineages/dsh-capability/editing-cordis-compositions/h1`. An independent
replication (fresh seed) reproduced 9/9 + 6/6 with 5/5 reliable. Claim: E2
local reliable evolution, bounded by the degraded-baseline design.

### 3.3 Efficiency track: a measurement boundary (E1)

Round 1 (small edits) showed no measurable Q3 movement. Round 2's large edit
(roster-service removed, 27.3% of SKILL.md) showed −16.1% tokens and was
provisionally promoted; the preregistered replication measured **−0.1%** —
the promotion was retracted, the lineage flagged, and the false positive
recorded in the conflict matrix. Conclusion: at 15-attempt granularity,
attempt-level token variance (±10–20%) dominates edits up to 27% of content;
Q3 effects require variance-controlled designs.

### 3.4 Prior coverage as a qualification boundary

The git-workflow target terminated after two suite designs (108 attempts):
four of six tasks were ceiling across all variants because git conventions are
industry-general knowledge, and the exact-template task failed even for
official-full because models paraphrase taught header phrases.

### 3.5 Cross-model replication (RQ4, first observation — E3 directional)

DeepSeek V4 flash re-ran both frozen DSH suites: editing matched GLM exactly
(9/3/3 + 6/3/3); headless held-out retained its gradient (5/1/1 vs 6/0/1) with
eval-pin still prior-resistant; headless held-in kept full ≥ none but with a
higher no-harness floor (5/9 vs 3/9). Gradient directions replicate on all four
partitions; prior floors are model-specific.

## 4. The Prior-Distance Mechanism and Its Measurement

### 4.1 Four converging observations

(i) invented eval-pin values → strong clean gradients; (ii) prior-resistant DSH
realm rules → clean degradation-recovery intervention; (iii) partially covered
WCAG tiers → narrow, variance-limited effects; (iv) fully covered git
conventions → ceiling fixtures. **Causal effect size scales with the distance
between harness content and model priors.**

### 4.2 Direct measurement (PRIOR_DISTANCE_MEASUREMENT_V1)

Guessability G = no-harness single-shot probe pass rate, scored with
grader-equivalent regexes. GLM calibration (n = 8 pairs): 6/8 follow the
negative-monotone G–E direction; both counterexamples carry identified
boundaries (B1 multi-item dilution → composite G; B2 exact-phrase paraphrase →
semantic graders). DeepSeek calibration: 4/4 within-model consistent; G is
measurably model-specific (commit-format G 0.33 → 1.0); invented and
DSH-composition items stay G = 0 on both models.

### 4.3 The pre-pilot gate and its first forward validation

A screening of `typescript-mcp-server-generator` (six dual-model probes)
produced a targeted design with frozen per-model effect predictions. The
ensuing pilot (DeepSeek phase, 54 attempts, user-authorized model amendment)
was the gate's first forward validation and it failed at the task level:
4/4 anchored predictions were out-of-range (held-out moved 4/6 -> 2/6 -> 0/6
with a strong combo anchor E=1.0, but two anchors ceilinged and one floored).
The V2 retrospective separated three failure modes: B3a context-reintroduced
priors (fixture wording restores guessability), B3c anchor/binding-constraint
mismatch (the fix consumed a covered item, not the anchor), and a
harness-transfer failure (the model migrated the error class but ignored the
field). The protocol now mandates context-aware probes, sub-item
decomposition, the weakest-ring prediction rule, and task-context-only
probes. Negative forward validations are first-class results: each failure
upgraded the measurement protocol rather than being hidden.

The v2 suite (B3c-corrected anchors) qualified held-out cleanly (4/6 ->
0/6 -> 0/6, combo anchor E=1.0) but held-in stayed noise-dominated; the
prediction tally improved from 0/4 to 1/4. A direct test of the
training-window hypothesis then exposed two probe-format artifacts (B4):
reasoning models emit answers in reasoning_content (runner fixed), and
single-shot abbreviated contexts cannot reproduce the multi-step
reasoning plus checker iteration that sets task-level floors. The samples
show partial SDK v2 priors in DeepSeek — the hypothesis is qualitatively
supported, but G (single-shot recall) is a lower bound on task floors for
reasoning models, not an unbiased estimate. The gate's predictive use is
therefore bounded to recall-dominant content, with the B4 caveat for
reasoning/iteration-heavy tasks.

A screening of `typescript-mcp-server-generator` (six dual-model probes)
produced a targeted design: anchor on three prior-resistant items
(NodeStreamableHTTPServerTransport naming, v2 package split, SSE/WebSocket
removal), avoid three prior-covered items, with per-model effect predictions
frozen for the pilot check.

## 5. Discussion

**Claim structure.** E2 (h1 capability recovery, bounded, locally replicated) is
the strongest correctness claim; E3-directional (R4) is the strongest
cross-model claim; the mechanism and measurement are E1-methodological; all
else is E0. No significance claims are made at 3-repeat granularity.

**Boundary conditions (registered, not hidden).** The capability intervention
did not transfer cross-repository (R3b); the efficiency effect did not
replicate (retraction); monotonic variant ordering broke once (headless
held-in on DeepSeek); single-item probes under-predict multi-item tasks;
exact-phrase tasks are paraphrase-confounded; task-level floors for
reasoning models are set by reasoning plus iteration (B4), so the probe
gate predicts floors, not ceilings.

**Threats.** Single operator; small suites (3–6 tasks); two models; n = 8–12
calibration pairs; Q4 not measured.

## 5.5 Correspondence with the Spatiotemporal Composability Paradigm

Our program runs on Cordis, the runtime realization of *A Programming Paradigm
for Spatiotemporal Composability* (Shi, Zhang, Cui). The paper's two guarantee
dimensions map onto our boundary catalogue as follows, and the mapping is
recorded in `INTEGRATION_MEMO_CORDIS.md`:

- **Temporal composability (revertible effects)** underlies D1 (task text must
  not contain the fix) and the full-release discipline of the dynamic-plugin
  lifecycle: every intervention we apply to a harness is a tracked context
  transformation with a defined inverse (reference repairs, lineage rollback),
  which is what makes the degraded-baseline design sound — h0-minus and its
  recovery are inverse transformations of the harness content.
- **Spatial composability (reactive coeffects)** underlies the realm-rule
  findings: `inject`/`provide` are coeffect declarations, the isolate-realm
  rule is the dependency-coordination constraint, and the R2 intervention
  shows that removing the coordination knowledge collapses behavior while a
  condensed equivalent restores it — content-level evidence that the
  coeffect specification, not its prose, is the load-bearing component.
- **Nominal vs structural linking (§6.6)** is the formal face of our
  prior-distance mechanism: model priors supply nominal knowledge of
  interfaces, which is why conventional names annihilate harness effects
  (B3a, B4b) while invented values (eval-pin) behave like key namespacing and
  keep the effect measurable. The guessability battery is therefore a
  measurement of nominal-link prior coverage.
- **Transition cases** of the composition calculus (withdrawal, failure,
  asynchrony) have measured instances in our integrity records: workspace
  escapes are failed withdrawals, Gate 0 aborts are failure cases, and the
  Q2 gate is a confluence check under interleaved edits.

The correspondence is descriptive, not a validation of the calculus: our
evidence bounds model-visible behavior, not runtime invariants (see the
memo's honesty clause).

## 6. Conclusion and Future Work

The program establishes: (a) DSH presets/skills are qualified tool-side harness
targets with discriminating gradients; (b) bounded single-surface edits can
recover degraded capability and replicate locally; (c) efficiency effects at
this granularity are unmeasurable by design; (d) prior distance is a measured,
calibrated, model-specific predictor usable as a pre-pilot gate. Future work:
Path A second data point (ts-mcp, screened), Path B second anchor, Q3
variance-controlled designs, Q4 human protocol, third model, and the
composite-G refinement (B1).

## Records

- Stage report: `DSH_STAGE_REPORT_V1.md`
- Archive index: `EXPERIMENT_ARCHIVE_V1.md`
- Rounds: `rounds/dsh-pilot-v1..v3`, `rounds/dsh-formal-baseline-v1`,
  `rounds/dsh-wp4-v1`, `rounds/dsh-wp4-r2`, `rounds/wcag-audit-patterns`,
  `rounds/git-workflow-and-versioning`, `rounds/r4-cross-model-v1`
- Lineages: `lineages/dsh-capability/editing-cordis-compositions/h1`
- Registries: `registries/sample-pool-dsh-v1.json`, `sample-pool-v2.json`,
  `evidence-map-v2.json`, `attention-conflict-matrix-v2.json`,
  `prior-guessability-probes-v1.json`
- Calibration: `results/prior-guessability/`
