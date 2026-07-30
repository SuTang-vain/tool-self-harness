# Using Git Worktrees Expanded Suite h0 vs h1 v3

Preregistered on 2026-07-30 after verifier-v3 validation and before any v3 model attempt.

## Reason for v3

Expanded-suite-v1 failed Gate 0 because hyphenated explicit inner-exit markers were not parsed.
Expanded-suite-v2 failed Gate 0 because `npm --prefix <worktree> test` was not classified as an
equivalent baseline test command. Both runs and their post-hoc rescores remain diagnostic only and
are not pooled or reused here.

Verifier v3 separates command classification from exit parsing. It accepts `npm test`, `npm run
test`, `npm --prefix <path> test`, and direct `node test.js`, and recognizes explicit exit markers
using spaces, underscores, or hyphens. Seven focused trace-parser/classifier assertions plus the
full 12-task fixture validation pass before evaluation.

## Frozen design

- baseline: frozen `stable/h0`
- candidate: frozen `stable/h1`
- model: GLM-5.2 through Volcengine Ark `coding/v3`, temperature 0
- suite: `using-git-worktrees-expanded-v3`
- tasks: 8 held-in + 4 held-out
- repeats: 3 fresh attempts per task and variant
- attempts: 72 total
- seed: `2026073073`
- run id: `using-git-worktrees-glm-expanded-v3`
- Q4: `not_measured`

## Gates

1. Abort on provider/API/infrastructure, leakage, task-tree, or verifier integrity errors.
2. Accept h1 only if it gains at least one reliable task, loses no reliable task on either split,
   and does not decrease held-in or held-out aggregate passes.
3. Report original-task and added-task subsets separately.
4. If Q2 passes but h1 has no held-in failures, retain h1 and stop candidate generation on this
   suite; held-out failures remain hidden and cannot seed proposals.
5. Q3 is descriptive only; Q4 remains `not_measured`.
