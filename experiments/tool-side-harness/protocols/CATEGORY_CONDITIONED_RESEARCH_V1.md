# Category-Conditioned Self-Harness Research Protocol v1

Status: formally established and preregistered for the next research phase on 2026-08-03.

This protocol operationalizes RQ1-RQ4 in `RESEARCH_CHARTER.md`. It does not claim that the four
structural categories are mutually exclusive or that category membership causes an outcome.

## 1. Primary questions and estimands

| RQ | Question | Primary target-level estimands |
|---|---|---|
| RQ1 | Do outcomes differ across targets? | qualification rate, promotion rate, stable gain/loss counts, task-exchange rate, held-out regression, descriptive Q3 deltas |
| RQ2 | Are outcomes associated with category? | category-stratified promotion/stable-gain/task-exchange summaries, with target as the replicate |
| RQ3 | Which structural features explain movement? | preregistered associations between feature vector and stable gains/losses, task exchange, Q3 movement, and mechanism-ablation outcomes |
| RQ4 | Does the pattern replicate? | direction and boundary replication across independent targets, then models; not measured in the current GLM-only phase |

The primary unit for RQ1-RQ4 is the **target skill and its frozen benchmark**, not an individual
attempt or task. Tasks and repeats provide within-target reliability evidence. Attempt-level
statistics may be reported descriptively or for paired verifier tests, but must not be treated as
independent category replicates.

## 2. Target sampling and eligibility

Each target must have:

- an explicit permissive license applying to the frozen source;
- a public immutable commit and local source/hash snapshot;
- an offline or replayable benchmark with hidden verifiers;
- a registered progressive surface and plausible non-ceiling headroom;
- a failure signature that is observable without exposing held-out labels to the proposer.

Market popularity is a **sampling-frame variable only**. It may justify inclusion or stratification,
but it must not be included as a causal predictor or used to claim that a skill is representative
of all skills.

## 3. Category coding

Record one `primary_category`, zero or more `secondary_categories`, and the structural feature
vector defined in `STRUCTURAL_FEATURES_V1.md`. Coding is frozen before candidate generation and
before looking at candidate outcomes. If later evidence challenges a label, preserve the original
label, record a blinded relabeling proposal, and treat the change as a new preregistered analysis.

The initial category vocabulary is:

- `workflow-state-transition`;
- `knowledge-rule-policy`;
- `resource-event-interaction`;
- `atomic-transform-validation`;
- `debugging-diagnosis`;
- optional secondary labels: `code-transformation`, `planning-orchestration`.

`debugging-diagnosis` is included as a structural category because it has a distinct
reproduce-localize-fix-verify process surface. The optional labels remain descriptive extensions,
not additional claims until enough targets are qualified.

## 4. Staged stop/go protocol

### Stage 0 — Inventory and freeze

Freeze source/license/commit/hash, structural coding, candidate surfaces, task-tree hash,
verifier hash, reference hash, model endpoint, and Q4 status. No model attempt is required.

### Stage 1 — Diagnostic qualification

Default: 6 held-in + 3 held-out tasks, one diagnostic repeat, and variants
`no-skill`, `minimal`, `official-full`. The diagnostic is allowed to use one fresh repeat only to
answer qualification questions; it is never Q2 evidence.

Proceed only if:

1. Gate 0 verifier integrity passes;
2. variants have genuinely different exposure and pass vectors;
3. minimal retains a held-in failure/headroom;
4. official-full changes the intended behavior or quality metric in the predicted direction;
5. the suite is neither floor nor ceiling saturated.

If any condition fails, stop and redesign. Do not generate a Self-Harness candidate.

### Stage 2 — Formal baseline

Run 3 fresh repeats per variant, with held-out hidden from any proposer. Freeze all seeds/configs and
don't pool diagnostic attempts. Compute Q1, Q2, Q3, false positives/negatives, task identity,
quality dimensions, reference use, and infrastructure audit.

### Stage 3 — Single-surface evolution

Only a qualified formal target may freeze `h0`. Expose held-in failure notes only. Generate bounded
candidates on one registered surface; evaluate each on the complete suite with 3 fresh repeats.
Promote only if Gate 0 passes, the reliable held-in set gains, no reliable held-in/held-out task is
lost, and no critical verifier regression occurs. Aggregate gain without stable identity preservation
is a stop, not a promotion.

### Stage 4 — Replication and category expansion

Before claiming a category effect, qualify at least one independent target in the same category;
three qualified targets/category are preferred for a confirmatory claim. Cross-model evaluation is
deferred until the GLM-only target map is stable.

## 5. Outcome reporting

Always report, separately by split and task family:

- aggregate pass count/rate (Q1);
- per-task stable set and stable gains/losses (Q2);
- task-exchange Jaccard distance;
- false positives/negatives and evidence/remediation completeness where applicable;
- reference usage and scan coverage;
- tokens, API/tool calls, retries, elapsed time and coverage (Q3);
- Q4 as `not_measured` unless a separate human protocol exists.

Never replace this vector with a weighted single score. A candidate with equal stable-task count but
changed identity is a task exchange and fails the non-regression gate.

## 6. Claim levels and stopping rules

- **E0:** one-run target observation or verifier audit.
- **E1:** qualified target-level association or bounded local movement without promotion.
- **E2:** Q2-safe local evolution on one target/model/distribution.
- **E3:** replicated target-level direction across an independent suite/target, with boundaries.
- **E4:** category-conditioned effect supported by at least two qualified targets in a category,
  preferably three, and registered counterexamples.
- **E5:** cross-model/category effect plus independent Q3/Q4 evidence.

The current phase may report E0-E3 and exploratory RQ2/RQ3 summaries. It must not report E4 or E5
from a single target, pooled attempts, or the two existing anchors alone.

## 7. Confound controls

Record endpoint (`coding/v3`, `plan/v3`, etc.), model, repository, source size, reference depth,
task size, verifier version, seed, and infrastructure status. Path B and Path C currently use
different GLM endpoints; endpoint is therefore a confound, not a category explanation. Do not pool
those results into a formal effect estimate until endpoint is controlled or explicitly modeled.
