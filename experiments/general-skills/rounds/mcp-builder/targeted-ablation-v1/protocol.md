# MCP Builder Targeted Edit Ablation v1

Preregistered on 2026-07-30 after two independent expanded GLM rejections of `h1-stable`.
This is a diagnostic experiment, not a new capability-promotion round.

## Question

Is the observed regression caused by the direct core-instruction strict-schema edit, or is it
primarily stochastic / shared across alternative edit surfaces?

## Variants

- `h0`: unchanged stable h0
- `h1-core`: Candidate 1 direct core strict-schema rule
- `h1-description`: Candidate 2 description reminder
- `h1-checklist`: Candidate 3 pre-finish checklist

## Tasks and repeats

Use the four recurring or representative regression tasks:

- held-in: `cancellation-cleanup`, `concurrent-state-isolation`, `prompt-template-render`
- held-out: `multi-client-isolation`

Run every variant on every selected task with 5 fresh repeats:

```text
4 variants × 4 tasks × 5 repeats = 80 attempts
```

Run id: `mcp-builder-glm-targeted-ablation-v1`. Use task-order seed `20260731` and no checkpoint
reuse. The held-out task is used only for post hoc diagnostic comparison; no proposer sees it.

## Primary diagnostic

Report per-task pass count, 5/5 reliable status, paired wins/losses against h0, and efficiency
metrics. This experiment does not promote a lineage.

## Interpretation

- If h1-core regresses on recurring tasks while h1-description/checklist do not, attribute the
  likely mechanism to the direct core edit.
- If all edits show similar movement, treat the evidence as stochastic or task-sensitive rather
  than a core-edit mechanism.
- If an alternative edit is non-regressive on all four tasks, it becomes a candidate for a new
  preregistered full-suite promotion study; it is not promoted from this diagnostic alone.
