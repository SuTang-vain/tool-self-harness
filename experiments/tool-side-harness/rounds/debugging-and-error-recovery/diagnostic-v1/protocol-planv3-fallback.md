# Debugging and Error Recovery Diagnostic — plan/v3 fallback

This is a complete fresh diagnostic cohort created after the coding/v3 endpoint returned
`AccountQuotaExceeded` on August 3, 2026. The partial coding/v3 attempt is discarded and is not
pooled.

- Model: GLM-5.2 via Volcengine Ark plan/v3
- Config: `glm-agent-config.yaml`
- API timeout: 360000 ms
- Variants: no-skill, minimal, official-full
- Tasks: 6 held-in + 3 held-out
- Repeats: 1
- Total: 27 attempts
- Held-out visibility: hidden
- Q4: not_measured

The endpoint is recorded as a confound. Results can qualify this benchmark for the fallback
cohort, but must not be pooled with coding/v3 results or interpreted as an endpoint-controlled
RQ2 comparison.
