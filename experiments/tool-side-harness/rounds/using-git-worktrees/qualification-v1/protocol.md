# Using Git Worktrees Qualification Protocol v1

Preregistered on 2026-07-30 before any GLM outcome was observed.

## Research role

- Target: `using-git-worktrees`
- Harness class: `multi-step workflow`
- Fitting path: `Path B: state transition and recovery`
- Purpose: benchmark qualification and 4D baseline calibration, not Self-Harness evolution

## Frozen suite

- 4 held-in and 2 held-out tasks
- all untouched fixtures fail the hidden verifier
- all external reference repairs pass
- task-tree SHA256: `093ebdbe3772942961b7aa011941d1bdb0fac18c0af2f015d5c3a7dce69b092e`
- verifier SHA256: `104c6e2944b4fb6fe5a8e06aa1ae0b62d1e241aef3d677795790b919362d601c`
- reference-repair SHA256: `5da56c97acb9a22732b24dcc4bf7ed19eafda97cd66040648d9b7106bd219e91`

## Variants

1. `no-skill`: no skill tools are exposed;
2. `minimal`: short locally authored baseline retaining the core target concept;
3. `official-full`: unmodified upstream skill at the frozen source commit.

## Model and execution

- GLM-5.2 through Volcengine Ark `coding/v3`
- temperature 0
- fresh workspace and model call per attempt
- no result/cache pooling between diagnostic and formal stages
- API/infrastructure failures abort the stage rather than count as task failures
- held-out evidence is not used for proposal generation; no proposer is run in qualification

## Stop/go design

### Stage D: diagnostic discrimination check

- 1 fresh repeat per task and variant
- 18 attempts total
- task-order seed: `2026073001`

Advance only if the suite is non-saturated and at least one skill-bearing variant changes a
verifier outcome or a preregistered process/loading behavior relative to no-skill. A completely
flat or universally failing suite stops for redesign.

### Stage F: formal baseline

If Stage D passes, run a separate 3-repeat comparison:

- 54 fresh attempts total
- task-order seed: `2026073002`
- do not pool the diagnostic attempts

A target becomes benchmark-qualified only if the formal comparison confirms measurable harness
sensitivity, retains headroom for a bounded candidate, and has complete task-level and Q3 usage
reporting. Q4 is `not_measured`.

## Reporting

Report held-in/held-out attempts, reliable tasks, per-task outcomes, tool/skill/reference loading,
tokens, tool calls, retries, and latency. Do not call qualification a lineage promotion.
