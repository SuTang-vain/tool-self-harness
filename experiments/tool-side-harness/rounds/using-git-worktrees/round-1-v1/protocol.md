# Using Git Worktrees Progressive Round 1 v1

Preregistered on 2026-07-30 after candidate generation and before any candidate evaluation.

## Parent and evidence isolation

- Parent: `experiments/tool-side-harness/lineages/using-git-worktrees/stable/h0`
- Parent source: minimal skill selected during qualification, not official-full
- Visible proposer evidence: held-in `default-hidden` failures only
- Held-out task names, traces, verifier messages, outcomes, and official-full content were hidden
- Primary class/path: multi-step workflow / Path B state transition and recovery

## Candidates

Three GLM-generated candidates are frozen under
`experiments/tool-side-harness/candidates/using-git-worktrees/round-1/`. Each replaces exactly the
L1 `core-instructions` heading block and targets the same tracked-ignore-before-create mechanism:

1. ordered numbered procedure;
2. named precondition gate;
3. emphasized bullet ordering.

No candidate is edited after generation.

## Evaluation

- model: GLM-5.2 through Volcengine Ark coding/v3, temperature 0
- variants: fresh `h0` plus candidate 1, 2, and 3
- suite: complete frozen 4 held-in + 2 held-out v3 suite
- repeats: 3 fresh attempts per task and variant
- total: 4 variants × 6 tasks × 3 repeats = 72 attempts
- run id: `using-git-worktrees-glm-round1-v1`
- task-order seed: `2026073007`
- no reuse or pooling of qualification attempts
- provider/API/infrastructure errors abort rather than count as failures

## Decision

Apply the frozen Q2-first reliable gate against the fresh h0 result:

1. gain at least one reliable task;
2. lose no reliable task on either split;
3. do not decrease held-in or held-out total passes;
4. introduce no critical verifier regression.

The historical aggregate gate is reported only as a diagnostic. Q3 is descriptive and Q4 is
`not_measured`. If multiple candidates pass, prefer the smallest semantically sufficient edit.
