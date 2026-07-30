# Using Git Worktrees Expanded Suite h0 vs h1 v2

Preregistered on 2026-07-30 after verifier-v2 fixture validation and before any v2 model attempt.

## Reason for v2

Expanded-suite-v1 was aborted at Gate 0 because its test-exit parser did not recognize explicit
hyphenated inner-exit markers such as `---exit:1---` and `TEST-EXIT-CODE: 1`. The v1 attempts and a
post-hoc rescore are retained only as a verifier integrity audit. They are not pooled or reused in
this formal comparison.

Verifier v2 recognizes direct tool exits and explicit exit markers with spaces, underscores, or
hyphens. Four parser unit tests and the full fixture validation pass before evaluation.

## Frozen design

- baseline: frozen `stable/h0`
- candidate: frozen `stable/h1`
- model: GLM-5.2 through Volcengine Ark `coding/v3`, temperature 0
- suite: `using-git-worktrees-expanded-v2`
- tasks: 8 held-in + 4 held-out
- repeats: 3 fresh attempts per task and variant
- attempts: 72 total
- seed: `2026073061`
- run id: `using-git-worktrees-glm-expanded-v2`
- Q4: `not_measured`

## Gates

1. Abort on provider/API/infrastructure, leakage, task-tree, or verifier integrity errors.
2. Accept h1 only if it gains at least one reliable task, loses no reliable task on either split,
   and does not decrease held-in or held-out aggregate passes.
3. Report original-task and added-task subsets separately.
4. If Q2 passes but h1 has no held-in failures, retain h1 and stop candidate generation for this
   suite because no valid held-in evidence remains. Do not mine held-out failures.
5. Q3 is descriptive only; Q4 remains `not_measured`.
