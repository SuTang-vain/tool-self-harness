# MCP Builder Expanded GLM Independent Replication v1

Preregistered on 2026-07-30 before the independent replication run.

## Question

Does the compact-suite GLM promotion `h1-stable` survive an independent evaluation on the frozen
36-task expanded distribution?

## Design

- Model: GLM-5.2 via Volcengine Ark coding/v3, temperature 0
- Lineages: `h0-expanded` and `h1-expanded`
- Suite: 24 held-in + 12 held-out tasks, unchanged task-tree hash
- Repeats: 3 fresh attempts per task and lineage
- Total: 2 × 36 × 3 = 216 attempts
- Run id: `mcp-builder-glm-expanded-replication-v1`
- Task order: deterministic seeded shuffle, seed `20260730`, same order schedule for both lineages
- h0 and h1 processes launched concurrently to reduce time/quotas confounding
- No checkpoints or outcomes from prior expanded run are reused or pooled
- API/infrastructure failures abort the run

## Analysis

Apply `reliable-task-set-v1` separately to this independent run. Report aggregate movement,
reliable task gains/losses, paired attempt wins/losses, and the four objective layers from the
research charter. The previous expanded run is a separate replication record, not an extra repeat.

## Decision

- Reliable accept: h1 gains a reliable task, loses none, and does not decrease either split
  aggregate.
- Reliable reject: retain h0 as the expanded stable baseline.
- If the independent result disagrees with the previous result, do not pool immediately; perform
  regression-task ablation and a third confirmatory run under a new preregistration.
