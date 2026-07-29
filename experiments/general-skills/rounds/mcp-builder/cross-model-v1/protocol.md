# MCP Builder Cross-Model Replication v1

Preregistered on 2026-07-29 before MiniMax-M3 or DeepSeek-V4-Pro outcomes.

## Design

Evaluate the frozen `h0-stable` and `h1-stable` lineages independently with:

- MiniMax-M3 (`minimax-config.yaml`)
- DeepSeek-V4-Pro (`deepseek-config.yaml`)

For each model and lineage, run all 8 held-in and 4 held-out tasks with 3 fresh repeats. This is
2 models × 2 lineages × 12 tasks × 3 repeats = 144 attempts. Historical outcomes are not pooled.
Fresh workspaces and model calls are required; API/infrastructure failures abort a run.

## Decision

Apply `reliable-task-set-v1` separately within each model. Report both the historical aggregate
gate and the reliable promotion gate. Do not aggregate pass counts across models.

- Per-model replication: `h1-stable` gains at least one 3/3 reliable task, loses none, and does
  not reduce either split's total passes.
- Cross-model support: both models independently pass the reliable gate.
- Mixed result: report model-specificity; do not weaken the gate or alter the frozen lineage.
