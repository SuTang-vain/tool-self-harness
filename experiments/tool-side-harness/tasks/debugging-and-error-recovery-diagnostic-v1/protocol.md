# Debugging and Error Recovery Diagnostic v1

Status: fixture-authored on 2026-08-03; Gate 0 pending. No model attempts are included in this
manifest.

- 6 held-in + 3 held-out tasks
- variants: no-skill, minimal, official-full
- one diagnostic repeat, 27 attempts
- model: GLM-5.2 via Volcengine Ark coding/v3
- held-out tasks and traces hidden from any proposer
- Q4: not_measured

The suite uses deterministic local JavaScript, Python, and Go fixtures. Hidden verification includes
functional regression checks and removes the visible hidden-test leakage present in the historical
systematic-debugging suite. Each task contains a protected decoy file that must remain unchanged.
