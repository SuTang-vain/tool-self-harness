# Security Review Qualification Protocol v1

Preregistered on 2026-07-30 before any GLM outcome was observed.

## Research role

- Target: `security-review`
- Harness class: `knowledge-rule / policy`
- Fitting path: `Path C: density control and pruning`
- Purpose: benchmark qualification and 4D baseline calibration, not Self-Harness evolution

## Frozen suite

- 4 held-in and 2 held-out tasks
- all untouched fixtures fail the hidden verifier
- all external reference repairs pass
- task-tree SHA256: `22c9a491407a1b71e97756f5d7f2d7802f3d9bc5067605a7dc8587ebf3bfe8db`
- verifier SHA256: `c986e53b31f334361ade7229420af63980a0df89ac4a06be1272add4cb9f6ca7`
- reference-repair SHA256: `549c5332cc26a746c4e973d1cf8e67e123b0007873efb6028ae8ea7132035270`

## Variants

1. `no-skill`: no skill tools are exposed;
2. `minimal`: short locally authored baseline retaining the core target concept;
3. `official-full`: unmodified upstream skill at the frozen source commit.

## Model and execution

- GLM-5.2 through Volcengine Ark `coding/v3`
- temperature 0
- fresh workspace and model call per attempt
- no result/cache pooling between diagnostic and formal stages
- API/infrastructure failures abort the stage rather than count as task failures
- held-out evidence is not used for proposal generation; no proposer is run in qualification

## Stop/go design

### Stage D: diagnostic discrimination check

- 1 fresh repeat per task and variant
- 18 attempts total
- task-order seed: `2026073001`

Advance only if the suite is non-saturated and at least one skill-bearing variant changes a
verifier outcome or a preregistered process/loading behavior relative to no-skill. A completely
flat or universally failing suite stops for redesign.

### Stage F: formal baseline

If Stage D passes, run a separate 3-repeat comparison:

- 54 fresh attempts total
- task-order seed: `2026073002`
- do not pool the diagnostic attempts

A target becomes benchmark-qualified only if the formal comparison confirms measurable harness
sensitivity, retains headroom for a bounded candidate, and has complete task-level and Q3 usage
reporting. Q4 is `not_measured`.

## Reporting

Report held-in/held-out attempts, reliable tasks, per-task outcomes, tool/skill/reference loading,
tokens, tool calls, retries, and latency. Do not call qualification a lineage promotion.
