# Security Review Path-C Formal Baseline v1 — Three-Repeat Canonical-ID Evaluation

Preregistered on 2026-07-31 after qualification-v5-rerun-v1 passed all diagnostic stop/go gates and
before any formal attempt.

## Purpose

Establish whether the one-repeat Path-C separation is reliable enough to freeze a minimal h0 for bounded
Self-Harness evolution. This is a baseline qualification study, not a candidate acceptance test.

## Frozen design

- model: GLM-5.2 via Volcengine Ark `plan/v3`
- config: `glm-agent-config.yaml`
- endpoint scope: plan/v3 only; no pooling with coding/v3
- suite: integrity-frozen `security-review-qualification-v5`
- report contract: strict `canonical-id-v1`
- variants: `no-skill`, `minimal`, `official-full`
- tasks: 6 held-in + 3 held-out
- fresh repeats: 3 per task and variant
- attempts: 81
- seed: `2026073122`
- run id: `security-review-glm-planv3-formal-v1`
- concurrency: 3 within each separately executed variant
- API timeout: 360,000 ms
- pooling: none from diagnostic or prior Path-C runs
- Q4: `not_measured`

Any API or infrastructure error aborts the formal run and is not counted as task failure. No selective
replacement attempt is allowed inside this run.

## Metrics

Report both aggregate and per-task reliability:

- mean pass count/rate over all attempts;
- stable task identity: a task is reliable only if it passes all 3 fresh repeats;
- held-in and held-out stable task counts;
- per-task pass vectors and variance;
- precision, recall, false positives, false negatives;
- evidence, remediation, finding-file, severity, files-scanned, and canonical-ID completeness;
- skill loading and deep-reference use;
- tokens, tool calls, and elapsed time as descriptive Q3 only.

No best-of-N task identity and no weighted total score are used.

## Gate 0

Pass only if:

1. frozen suite/verifier/reference hashes match qualification-v5;
2. 81/81 attempts complete without API/infrastructure error;
3. every emitted `canonical_id` belongs to the frozen taxonomy and no alias mapping is needed;
4. no source-fixture or verifier defect is discovered.

## Formal stop/go decision

Freeze `minimal` as Path-C h0 and proceed to bounded Self-Harness Round 1 only if all conditions hold:

1. **headroom:** minimal has at least one non-reliable held-in task;
2. **skill value:** official-full has strictly more reliable held-in tasks than minimal and at least as many
   as no-skill;
3. **held-out safety:** official-full has no reliable held-out task regression versus minimal and no lower
   held-out aggregate pass count;
4. **aggregate support:** official-full held-in aggregate pass count is strictly higher than minimal;
5. **deep-reference behavior:** official-full reads a deep reference in at least 9/27 attempts;
6. **schema integrity:** all observed differences remain scoreable without post-hoc aliases.

If the gate passes, h0 is the unchanged minimal skill. Candidate generation may use only held-in failure
notes; held-out traces and expected findings remain hidden. If it fails, do not freeze h0 and do not generate
a Path-C candidate.
