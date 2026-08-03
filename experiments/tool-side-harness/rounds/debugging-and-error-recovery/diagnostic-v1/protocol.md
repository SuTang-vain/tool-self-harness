# Debugging and Error Recovery Diagnostic v1

Preregistered on August 3, 2026 before model evaluation.

- Model: GLM-5.2 via Volcengine Ark coding/v3, temperature 0
- Variants: no-skill, minimal, official-full
- Suite: 6 held-in + 3 held-out
- Repeats: 1 diagnostic repeat
- Attempts: 27
- Prompt mode: diagnostic-neutral (no runner-supplied reproduce/localize/guard sequence)
- Infrastructure errors abort and do not count as task failures
- Q4: not_measured

Go to a three-repeat formal baseline only if Gate 0 remains valid, the variants show genuine task or process separation, minimal retains held-in headroom, official-full changes the intended behavior, and neither split is saturated. This run cannot establish Q2 or authorize candidate generation by itself.
