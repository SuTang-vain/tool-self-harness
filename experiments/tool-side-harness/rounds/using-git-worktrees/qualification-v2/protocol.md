# Using Git Worktrees Qualification Protocol v2

Preregistered on 2026-07-30 after the v1 diagnostic identified a verifier instrumentation defect
and before any v2 model outcome was observed.

## Version change

The task content, expected Git state, upstream skill, variants, and acceptance questions are
unchanged. The verifier now recognizes an explicitly echoed `npm test` exit code when a shell
wrapper such as `npm test; echo EXIT_CODE=$?` causes the outer command to return zero. v1 attempts
are diagnostic only and are not rescored or pooled.

## Frozen suite

- 4 held-in + 2 held-out tasks
- untouched fixtures fail; reference repairs pass
- task-tree SHA256: `093ebdbe3772942961b7aa011941d1bdb0fac18c0af2f015d5c3a7dce69b092e`
- verifier SHA256: `7a5aa47aa9d78fe56608fb75986b347a3d8aeba62b6d2f915ca82d2d624bda0a`
- reference SHA256: `5da56c97acb9a22732b24dcc4bf7ed19eafda97cd66040648d9b7106bd219e91`

## Diagnostic rerun

- variants: no-skill, minimal, official-full
- GLM-5.2 through Volcengine Ark coding/v3, temperature 0
- 1 fresh repeat, 18 attempts total
- run id: `using-git-worktrees-glm-qualification-diagnostic-v2`
- seed: `2026073003`

Proceed to formal baseline only if verifier outcomes remain non-saturated and a skill-bearing
variant changes task success relative to no-skill.

## Formal baseline if diagnostic passes

- 3 fresh repeats, 54 attempts
- run id: `using-git-worktrees-glm-qualification-formal-v2`
- seed: `2026073004`
- no pooling with v1 or either diagnostic run
- Q4 remains `not_measured`
