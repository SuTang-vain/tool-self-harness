# Systematic Debugging GLM Pilot v1

Preregistered on 2026-07-29 before formal pilot outcomes.

## Design

- Model: GLM-5.2 through Volcengine Ark coding/v3, temperature 0
- Variants: no-skill, minimal systematic-debugging, official full systematic-debugging
- Suite: 8 held-in + 4 held-out debugging tasks
- Repeats: 2 fresh attempts per task and variant
- Total: 3 × 12 × 2 = 72 attempts
- Run id: `systematic-debugging-glm-pilot-v1`
- Fresh workspaces and model calls; no historical checkpoint reuse
- API/infrastructure errors abort rather than count as failures

## Pilot questions

1. Does either skill variant improve held-in total passes or stable 2/2 task count over no-skill
   without reducing either held-out measure?
2. Is the suite non-trivial (no variant at a complete held-in and held-out ceiling)?
3. Does the skill alter expected debugging behavior such as testing before the first edit and
   testing after the last edit?

## Advancement rule

Advance to a systematic-debugging Self-Harness round only if a skill-bearing seed has measurable
room for improvement and the benchmark shows a non-negative static skill effect. This pilot is a
benchmark qualification test, not by itself evidence of Self-Harness evolution.
