# Using Git Worktrees Expanded Suite h0 vs h1 v1

Preregistered on 2026-07-30 after fixture validation and before any expanded-suite model attempt.

## Objective

Test whether the h1 reliable advantage survives a broader Path-B state-transition suite rather than
only the original 4+2 tasks. This is a fresh evaluation and is not pooled with qualification, Round
1, or the independent 4+2 replication.

## Frozen design

- baseline: frozen `stable/h0`
- candidate: frozen `stable/h1`
- model: GLM-5.2 through Volcengine Ark `coding/v3`, temperature 0
- suite: `using-git-worktrees-expanded-v1`
- tasks: 8 held-in + 4 held-out
- repeats: 3 fresh attempts per task and variant
- attempts: 72 total
- seed: `2026073047`
- run id: `using-git-worktrees-glm-expanded-v1`
- Q4: `not_measured`

The six added fixtures cover pre-existing branch collision, dirty source preservation, detached HEAD,
existing-worktree reuse, submodule preservation, and baseline setup/readiness failure. All 12
untouched fixtures fail and all 12 external reference repairs pass before model evaluation.

## Gates

1. Abort on provider/API/infrastructure, leakage, task-tree, or verifier integrity errors.
2. Accept h1 on the expanded suite only if it gains at least one reliable task, loses no reliable
   task on either split, and does not decrease held-in or held-out aggregate passes.
3. Report original-task and added-task subsets separately to expose whether gains are broad or merely
   inherited from the original suite.
4. If Q2 passes, retain h1 and mine held-in failures for Round 2. If Q2 fails, stop Round-2 proposal
   generation and downgrade the current promotion claim to suite-local.
5. Q3 is descriptive only; Q4 remains `not_measured`.
