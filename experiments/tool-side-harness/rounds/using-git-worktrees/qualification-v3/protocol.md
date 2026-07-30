# Using Git Worktrees Qualification Protocol v3

Preregistered on 2026-07-30 after v2 formal traces exposed command-spelling sensitivity and before
any v3 model outcome was observed.

## Version change

The tasks, expected Git states, source skill, variants, and decision questions are unchanged. The
verifier now accepts the repository's test script when invoked either through `npm test`/`npm run
test` or directly as `node test.js`. It still requires the command to run in the expected worktree
and checks the actual/explicit exit state. v1 and v2 attempts remain diagnostic and are not pooled.

## Frozen suite

- 4 held-in + 2 held-out tasks
- untouched fixtures fail; reference repairs pass
- task-tree SHA256: `093ebdbe3772942961b7aa011941d1bdb0fac18c0af2f015d5c3a7dce69b092e`
- verifier SHA256: `1f00104e193e3f1a36abf837cf5b51470fedfb5abc30ba64a045119492bf6530`
- reference SHA256: `5da56c97acb9a22732b24dcc4bf7ed19eafda97cd66040648d9b7106bd219e91`

## Diagnostic

- no-skill, minimal, official-full
- GLM-5.2 via Volcengine Ark coding/v3, temperature 0
- 1 fresh repeat; run id `using-git-worktrees-glm-qualification-diagnostic-v3`
- seed `2026073005`

Proceed only if outcomes are non-saturated and skill-bearing variants remain distinguishable.

## Formal baseline if diagnostic passes

- 3 fresh repeats; run id `using-git-worktrees-glm-qualification-formal-v3`
- seed `2026073006`
- no pooling with any v1/v2/v3 diagnostic attempt
- Q4 is `not_measured`
