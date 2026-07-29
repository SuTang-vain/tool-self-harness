# General-Skill Self-Harness Experiments

This experiment track tests whether Self-Harness generalizes beyond the domain-specific
`sg-data-pack` skill.

## Targets

### systematic-debugging

- Source: `obra/superpowers`, `skills/systematic-debugging`
- Source commit: `44c9b2d6e889982ac18c27d05a19fefe335194e1`
- License: MIT
- Variants: `no-skill`, `minimal`, `full`
- Primary verifier: native project tests plus hidden edge-case tests

### mcp-builder

- Source: `anthropics/skills`, `skills/mcp-builder`
- Source commit: `b29e7cf65e5cb78a5ac33d582270551bc74a14eb`
- License: Apache-2.0
- Variants: `no-skill`, `minimal`, `full`
- Primary verifier: tool discovery, JSON Schema, valid calls, invalid calls, and unknown-tool behavior

## Smoke suites

Each initial smoke suite contains 3 held-in tasks and 1 held-out task. These are
infrastructure checks, not publication-quality evidence. Every initial fixture fails its
verifier; a reference solution passes every public and hidden check.

## GLM-5.2 coding/v3 smoke results (one attempt per task)

| Suite | Variant | Held-in | Held-out | Notes |
|---|---|---:|---:|---|
| systematic-debugging | no-skill | 2/3 | 1/1 | test-before-edit 75% |
| systematic-debugging | minimal | 2/3 | 1/1 | skill loaded on 50% of tasks |
| systematic-debugging | full | 2/3 | 1/1 | skill loaded 100%; test-before/after edit 100% |
| mcp-builder | no-skill | 1/3 | 0/1 | calculator only |
| mcp-builder | minimal | 2/3 | 0/1 | customer + calculator |
| mcp-builder | full | 2/3 | 0/1 | notes + calculator; references read on all tasks |

The systematic-debugging skill changed process adherence but not task pass rate in this
single-attempt smoke. The mcp-builder variants improved held-in pass count from 1/3 to 2/3,
which provides initial headroom for a larger repeated pilot. Neither suite shows held-out
improvement yet.

## Next pilot gate

Before running Self-Harness proposals:

1. Expand each suite to 8 held-in + 4 held-out tasks.
2. Run 2 independent attempts for no-skill, minimal, and full variants.
3. Require the official full skill to outperform no-skill on aggregate or behavioral metrics.
4. Use paper-faithful mean attempt pass rate and the stricter per-task stable rate side by side.
5. Only begin weakness mining from a minimal baseline with measurable headroom.

## Expanded MCP pilot (8 held-in + 4 held-out, two attempts)

GLM-5.2 coding/v3 results:

| Variant | Held-in attempts | Held-in stable | Held-out attempts | Held-out stable |
|---|---:|---:|---:|---:|
| no-skill | 12/16 (75.0%) | 5/8 | 4/8 (50.0%) | 2/4 |
| seed-h0 | 14/16 (87.5%) | 7/8 | 4/8 (50.0%) | 2/4 |
| minimal | 16/16 (100%) | 8/8 | 4/8 (50.0%) | 2/4 |
| official-full | 13/16 (81.25%) | 5/8 | 5/8 (62.5%) | 2/4 |

The benchmark gate passes: a short MCP skill improves held-in performance without held-out
regression. The official full skill is not the upper bound in this environment; its longer
context produces more analysis and several unstable task outcomes. `seed-h0` is the proposed
Self-Harness starting point because it improves over no-skill while retaining one stable
held-in failure (`notes-store`) and two stable held-out failures (`event-page`,
`inventory-search`).

The next stage is one full Self-Harness round from `seed-h0`, with held-out traces hidden from
weakness mining and both paper-mean and per-task-stable acceptance decisions recorded.

## MCP Self-Harness round 0 from seed-h0

Only the stable held-in `notes-store` failure was exposed to the GLM proposer. Held-out task
names, traces, and failures were omitted. The proposer generated two single-surface edits:

1. Add `additionalProperties:false` to the core instructions.
2. Add the same strict-schema requirement to the frontmatter description.

Both candidates were evaluated on all 8 held-in + 4 held-out tasks with two independent
attempts per task.

| Harness | Held-in attempts | Held-in stable | Held-out attempts | Held-out stable |
|---|---:|---:|---:|---:|
| seed-h0 | 14/16 | 7/8 | 4/8 | 2/4 |
| candidate 1 (body) | 15/16 | 7/8 | 4/8 | 2/4 |
| candidate 2 (description) | 16/16 | 8/8 | 3/8 | 1/4 |

Candidate 1 is accepted by the paper-style aggregate mean gate (`14 -> 15` held-in, held-out
flat), but rejected by the stable-task gate: it makes `notes-store` stable while changing
`customer-directory` from 2/2 to 1/2. Candidate 2 fixes `notes-store` stably but regresses
held-out `order-status` and is rejected by both gates.

No candidate is promoted into `h1` under the stable non-regressive rule. This round provides a
concrete divergence between aggregate and per-task acceptance: aggregate counts can accept a
candidate that swaps which task is reliable without increasing the number of reliable tasks.
