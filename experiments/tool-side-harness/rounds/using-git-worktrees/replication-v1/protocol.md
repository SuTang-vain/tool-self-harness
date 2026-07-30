# Using Git Worktrees h0 vs h1 Independent Replication v1

Preregistered on 2026-07-30 before any replication attempt.

## Objective

Test whether the Round-1 h1 promotion replicates under a fresh GLM-5.2 run, without pooling
historical qualification or Round-1 attempts. The primary question is whether the reliable task-set
gains remain stable across a new random task order and fresh model/tool traces.

## Frozen comparison

- baseline: `experiments/tool-side-harness/lineages/using-git-worktrees/stable/h0`
- candidate: `experiments/tool-side-harness/lineages/using-git-worktrees/stable/h1`
- model: GLM-5.2 through Volcengine Ark `coding/v3`, temperature 0
- suite: frozen Using Git Worktrees v3 suite
- tasks: 4 held-in + 2 held-out
- repeats: 3 fresh attempts per task and variant
- pairing: same task-order seed for h0 and h1
- seed: 2026073031 (distinct from qualification and Round 1)
- run id: `using-git-worktrees-glm-replication-v1`
- held-out: hidden from any proposer; no proposer is run in this replication
- Q4: `not_measured`

## Stop/go gates

1. Abort for API, infrastructure, leakage, suite-integrity, or verifier errors.
2. Q2 replication passes only if h1 gains at least one reliable task, loses no reliable task on
   either split, does not decrease held-in or held-out aggregate passes, and has no critical verifier
   regression.
3. If Q2 passes, classify the gained task identities and proceed to the preregistered 8+4 suite
   expansion. If Q2 fails, stop the Path-B promotion lineage and record the failure; do not generate
   Round-2 candidates from h1.
4. Q3 is descriptive only; no efficiency claim is made. Q4 remains `not_measured`.

## Analysis isolation

This replication result is not pooled with qualification or Round 1. It is compared only as a fresh
paired h0 versus h1 evaluation. Per-task reliability means all three repeats pass.
