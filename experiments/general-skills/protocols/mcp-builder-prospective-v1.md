# MCP Builder Prospective Lineage Protocol v1

Status: preregistered before the prospective runs.

## Research question

Does the Round-0 aggregate-gate winner (`h1-paper`) reproducibly improve over the strict
stable lineage (`h0-stable`) when both are evaluated from fresh workspaces and fresh model
calls?

## Frozen inputs

- Model: GLM-5.2 through Volcengine Ark coding/v3
- Temperature: 0
- Task suite: 8 held-in + 4 held-out MCP Builder tasks
- Lineages:
  - `h0-stable`: unchanged Round-0 `seed-h0`
  - `h1-paper`: `seed-h0` plus Round-0 Candidate 1
- Repeats: 3 new attempts per task and lineage
- Total: 2 lineages × 12 tasks × 3 repeats = 72 attempts
- Run id: `mcp-builder-glm-prospective-v1`
- Historical two-repeat results are not pooled with this run.
- Each attempt uses an independently initialized workspace. Checkpoint reuse is forbidden at
  run start. Infrastructure/API failures abort the run rather than counting as task failures.

## Blinding

The proposer saw only held-in evidence when Candidate 1 was generated. Held-out task traces,
verifier behavior, and failures remain unavailable to proposal generation. Evaluation may run
hidden held-out verifiers, but no held-out result may be used to alter the frozen lineages or
rules below.

## Gate A: historical aggregate gate

For each split, aggregate all fresh attempt outcomes across tasks and repeats.

Accept `h1-paper` iff either:

1. held-in total passes increase and held-out total passes do not decrease; or
2. held-out total passes increase and held-in total passes do not decrease.

This is the paper-style result. It is reported but is not sufficient for strict promotion.

## Gate B: reliable task-set gate (promotion gate)

A task is reliable only if it passes all 3 fresh repeats (`3/3`).

Accept and promote `h1-paper` iff all conditions hold:

1. at least one new reliable task is gained across held-in or held-out;
2. no previously reliable task is lost on either split;
3. held-in total passes do not decrease; and
4. held-out total passes do not decrease.

Otherwise the stable lineage remains at `h0-stable`.

## Interpretation

- Gate A accept + Gate B accept: reproducible positive lineage transition.
- Gate A accept + Gate B reject: aggregate improvement is a task exchange or repeat variance;
  no strict Self-Harness evolution claim.
- Both reject: the historical aggregate accept does not reproduce prospectively.
- Gate A reject + Gate B accept: report as a protocol mismatch and retain Gate B for strict
  promotion; do not retrospectively change either gate.
