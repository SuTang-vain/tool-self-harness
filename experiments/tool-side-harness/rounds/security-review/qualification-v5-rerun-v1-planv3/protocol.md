# Security Review Path-C Qualification v5 Rerun v1 — Timeout-Calibrated Fresh Diagnostic

Preregistered on 2026-07-31 after qualification-v5 was aborted by one infrastructure timeout and before
any rerun attempt.

## Relationship to v5

The v5 canonical-ID suite, task prompts, source fixtures, hidden expected findings, verifier, reference
reports, variants, model, endpoint, metrics, and qualification gates are unchanged. The completed 26/27
v5 attempts are not pooled, reused, or scored as a qualification result.

The only runtime calibration is increasing the per-API-call client timeout from 240,000 ms to 360,000 ms.
The v5 failure occurred when one continuing model response reached the prior 240-second local
`AbortSignal` limit; it was not a verifier or task outcome.

## Frozen rerun

- stage: diagnostic qualification only
- model: GLM-5.2 via Volcengine Ark `plan/v3`
- config: `glm-agent-config.yaml`
- variants: `no-skill`, `minimal`, `official-full`
- suite: `security-review-qualification-v5`
- tasks: 6 held-in + 3 held-out
- repeats: 1
- attempts: 27 entirely fresh attempts
- seed: `2026073118`
- run id: `security-review-glm-planv3-qualification-diagnostic-v5-rerun-v1`
- concurrency: 3 within each separately executed variant
- `GENERIC_RUNNER_API_TIMEOUT_MS=360000`
- pooling: none from v1–v5, including the aborted v5
- Q4: `not_measured`

Any API or infrastructure error still aborts this rerun and is not counted as task failure. No replacement
or selective task retry is allowed inside this registered run.

## Gates and metrics

Gate 0, all task and finding-quality metrics, Q3 reporting, and qualification signal thresholds are exactly
those frozen in `qualification-v5/protocol.md`:

1. verifier/schema integrity and deterministic exact canonical IDs;
2. minimal held-in headroom (at most 5/6);
3. non-identical held-in pass vectors and official-full not below minimal held-in pass count;
4. official-full reference use in at least 3/9 attempts;
5. versus minimal, official-full gains a held-in task or improves held-in recall, evidence completeness,
   or remediation completeness by at least 0.05 without losing held-in task passes.

One repeat remains diagnostic and cannot establish Q2 reliability or promote a lineage.
