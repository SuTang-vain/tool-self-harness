# Security Review Path-C Qualification v5 — Canonical-ID Contract Diagnostic

Preregistered on 2026-07-31 after the v4 taxonomy-integrity stop and before any v5 model attempt.

## Why v5 exists

V4 reused integrity-corrected source fixtures, but its free-form `category` field required an open-ended
alias table. Semantically correct labels such as `rce`, `secrets`, and compound authorization labels could
change task outcomes depending on post-hoc alias additions. That is a verifier-schema defect, so all v4
qualification outcomes remain invalidated.

V5 changes the report contract, not the source repositories or hidden ground truth:

- every finding must contain an exact `canonical_id` from one globally visible 16-ID taxonomy;
- optional `category_label` remains free-form and is ignored by scoring;
- aliases, capitalization normalization, and task-specific semantic remapping are not accepted;
- task-specific expected IDs, key files, finding counts, protected decoys, evidence markers, and
  remediation markers remain hidden;
- the taxonomy is an output ontology, not a statement that any listed weakness exists in a task.

## Frozen diagnostic

- stage: diagnostic qualification only
- model: GLM-5.2 via Volcengine Ark `plan/v3`
- config: `glm-agent-config.yaml`
- endpoint note: this is a fresh endpoint-specific diagnostic and is not pooled with `coding/v3`
- variants: `no-skill`, `minimal`, `official-full`
- suite: `security-review-qualification-v5`
- tasks: 6 held-in + 3 held-out
- repeats: 1
- attempts: 27 fresh attempts
- seed: `2026073117`
- run id: `security-review-glm-planv3-qualification-diagnostic-v5`
- attempt pooling: none from v1–v4 or aborted runs
- concurrency: 3 within each variant; variants run separately
- Q4: `not_measured`

The source fixture content is copied unchanged from integrity-corrected v4. Only task report instructions,
strict canonical-ID scoring, reference report generation, and suite metadata change.

## Metrics

For each variant report:

- held-in and held-out task pass;
- finding precision and recall;
- false-positive and false-negative counts;
- evidence, remediation, finding-file, severity, and files-scanned completeness;
- canonical-ID validity and report structure validity;
- skill loading and deep-reference usage;
- tokens, tool calls, and elapsed time as descriptive Q3 measures.

No weighted aggregate score is used. One diagnostic repeat cannot establish Q2 reliability and cannot
promote a skill lineage.

## Stop/go gates

### Gate 0 — verifier and schema integrity

Pass only if all of the following hold:

1. 9/9 untouched fixtures fail and 9/9 external reference reports pass;
2. every hidden expected ID belongs to the published global taxonomy;
3. all model reports can be scored deterministically from exact `canonical_id` values;
4. no outcome requires a new alias or post-hoc semantic category mapping;
5. API/infrastructure errors are absent. Any such error aborts the stage and is not a task failure.

### Qualification signal

Proceed to a three-repeat formal Path-C baseline only if Gate 0 passes and all conditions below hold:

1. **minimal headroom:** minimal passes at most 5/6 held-in tasks;
2. **genuine variant separation:** the three variants do not have identical held-in pass vectors, and
   official-full is not worse than minimal in held-in task pass count;
3. **deep-reference sensitivity:** official-full reads a reference in at least 3/9 attempts and, relative
   to minimal, either gains at least one held-in task pass or improves held-in mean recall,
   evidence completeness, or remediation completeness by at least 0.05 without losing held-in passes;
4. no newly discovered fixture or verifier defect invalidates an observed difference.

Held-out results are reported but are not used to generate or revise a candidate. If the qualification
signal fails, Path-C stops for benchmark redesign; no h0 is frozen and no Self-Harness candidate is generated.
