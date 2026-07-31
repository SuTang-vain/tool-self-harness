# Security Review Path-C Qualification v3 Fresh Rerun v2 — Alternate Volcengine Quota

Preregistered on 2026-07-31 after explicit user authorization to use the alternate Volcengine quota and before any rerun attempt.

## Provider amendment

The primary Volcengine `coding/v3` quota returned `AccountQuotaExceeded`. A second configured
Volcengine credential cannot authenticate against `coding/v3`, but successfully serves the same
GLM-5.2 model through Ark `plan/v3` (`glm-5-2-260617`). This rerun therefore changes the endpoint
and quota together. It does not mix endpoint variants and cannot be pooled with the aborted
`coding/v3` attempts.

## Fresh comparison

- model: GLM-5.2 via Volcengine Ark `plan/v3`
- config: `glm-agent-config.yaml`
- suite: `security-review-qualification-v3-verifier-v2`
- variants: no-skill, minimal, official-full
- tasks: 6 held-in + 3 held-out
- repeats: 1 fresh repeat
- attempts: 27
- seed: `2026073107`
- run id: `security-review-glm-planv3-qualification-diagnostic-v3-rerun-v2`
- no attempt reuse or pooling from any coding/v3 run

The task, metric, verifier-integrity, minimal-headroom, and deep-reference-sensitivity gates remain
unchanged. Any conclusion is limited to GLM-5.2 through the plan/v3 endpoint unless separately
replicated under coding/v3 after its quota resets.
