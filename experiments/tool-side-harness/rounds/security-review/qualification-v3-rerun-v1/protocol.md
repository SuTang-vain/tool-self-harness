# Security Review Path-C Qualification v3 Fresh Rerun v1

Preregistered on 2026-07-31 after the original v3 diagnostic was aborted by provider quota and before any rerun attempt.

## Reason for rerun

The original run completed no-skill and minimal, but official-full stopped after one completed task
because Volcengine returned `AccountQuotaExceeded`. The provider states that the quota resets on
August 17, 2026 at 23:59:59 +08:00. Infrastructure failures are not task failures, so the original
run has no stop/go interpretation.

The partial reports also exposed task-specific but substantively correct labels such as
`broken-access-control`, `oauth-redirect-uri-validation`, `jwt-jku-key-injection`, and
`secrets-management`. A verifier-v2 alias layer was frozen without changing prompts, source files,
findings, decoys, severity floors, or task mechanisms.

## Fresh rerun design

- suite: `security-review-qualification-v3-verifier-v2`
- model: GLM-5.2 via Volcengine Ark `coding/v3`
- variants: no-skill, minimal, official-full
- tasks: 6 held-in + 3 held-out
- repeats: 1
- attempts: 27 fresh attempts
- seed: `2026081801`
- run id: `security-review-glm-qualification-diagnostic-v3-rerun-v1`
- earliest scheduled execution: after August 17, 2026 at 23:59:59 +08:00, unless quota is restored earlier
- no reuse or pooling of any original v3 attempt

All original v3 task, metric, reference-sensitivity, and stop/go requirements remain unchanged.
Provider/API errors abort the rerun. Only the complete three-variant fresh rerun can receive a
diagnostic stop/go decision.
