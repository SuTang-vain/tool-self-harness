# Final Acceptance Protocol: Reliable Task-Set v1

Frozen on 2026-07-29 after the preregistered MCP Builder prospective comparison. This protocol
applies to all subsequent generic-skill Self-Harness rounds; it must not be changed in response
to a candidate result.

## Required evaluation

- Evaluate the current stable baseline and every candidate on the complete held-in and held-out
  suite.
- Use at least 3 fresh repeats per task for formal promotion decisions.
- Start every attempt from a fresh workspace and model call. Do not pool historical runs or reuse
  checkpoints from another variant.
- Abort on provider/API/infrastructure errors; do not score them as task failures.
- Keep held-out task evidence hidden from proposal generation.

## Reported paper gate

Report the historical aggregate gate for comparison: one split's total pass count must improve
while the other does not decrease. This gate is diagnostic only.

## Promotion gate

A task is reliable only if it passes every fresh repeat. Promote a candidate only when:

1. it gains at least one reliable held-in or held-out task;
2. it loses no reliable task on either split;
3. held-in total pass count does not decrease; and
4. held-out total pass count does not decrease.

If multiple candidates pass, prefer the smallest edit. For combinations, use greedy forward
selection: only add a patch when the combined harness independently passes the same promotion
gate against the current stable lineage.

## Interpretation rule

A paper-gate accept that fails the promotion gate is not a lineage transition and must not be
reported as positive Self-Harness evolution. It may be reported as aggregate improvement,
variance, or a reliable-task exchange according to the task-level results.
