# Structural Feature Coding Rubric v1

Frozen as the coding companion to `CATEGORY_CONDITIONED_RESEARCH_V1.md` on 2026-08-03.

## 1. Required record

Each target record must contain:

```yaml
primary_category: workflow-state-transition
secondary_categories: []
statefulness: low|medium|high
procedural_depth: low|medium|high
rule_density: low|medium|high
reference_depth: low|medium|high
output_constraint_count: integer
verifier_observability: low|medium|high
task_coupling: low|medium|high
edit_locality: low|medium|high
context_tokens: integer|null
coding_confidence: low|medium|high
coding_basis: string
```

`context_tokens` is the frozen skill/reference token count used by the runner, not an estimate of
model attention. Missing values are recorded as `null`; they are not imputed silently.

## 2. Coding definitions

| Feature | Low | Medium | High |
|---|---|---|---|
| `statefulness` | static answer or isolated transform | local state persists across steps | correctness depends on multiple filesystem/process/resource states |
| `procedural_depth` | 0-2 consequential steps | 3-5 ordered steps | 6+ steps or branching recovery protocol |
| `rule_density` | few independent rules/checks | several conditional rules | dense exceptions, taxonomies, or cross-rule dependencies |
| `reference_depth` | no reference or one shallow file | one linked reference with operational content | multiple deep references, taxonomies, or deferred resources |
| `verifier_observability` | mostly subjective/output-semantic checks | deterministic checks cover main behavior | deterministic hidden checks cover behavior, evidence, and critical regressions |
| `task_coupling` | task families share little state/attention | some rules apply across families | global rule can alter behavior across unrelated families or files |
| `edit_locality` | one narrow sentence/node | one heading or bounded reference unit | broad body/repository rewrite required for intended change |

`output_constraint_count` counts independently verifiable output obligations in the frozen contract,
for example required fields, canonical IDs, evidence markers, files, severity, or remediation.
It is a count, not a quality judgment.

## 3. Feature-derived outcomes

For every formal candidate comparison compute:

- `stable_gain_set = stable(candidate) - stable(parent)`;
- `stable_loss_set = stable(parent) - stable(candidate)`;
- `task_exchange_jaccard = 1 - |intersection| / |union|`, reported separately for held-in and held-out;
- `aggregate_delta` and `stable_task_delta`, never one without the other;
- `held_out_regression` as any stable loss or critical failure on held-out;
- `promotion = true` only after the preregistered Q2 gate, not from aggregate pass count.

For target-level summaries also record qualification status, promotion status, Q3 movement, and
whether the effect was prospective, replicated, diagnostic, or post hoc.

## 4. Coding procedure

1. Code source structure and benchmark/verifier design before model evaluation.
2. Store the code, evidence, and confidence in the target registry.
3. Freeze the record before any proposer sees held-in failures.
4. If a label is disputed, preserve the original and add a blinded adjudication record; do not
   relabel after candidate results to improve a narrative.
5. Use the feature vector to generate hypotheses, not to justify post-hoc causal claims.

## 5. Analysis restrictions

Targets from the same repository are not independent if the source or benchmark construction is
shared; report repository clustering. Endpoint and model are covariates/confounds. Task and attempt
counts cannot increase the category replicate count. With fewer than two independent targets in a
category, report only a local observation. With two targets, report exploratory association; reserve
confirmatory category language for three targets plus independent replication.
