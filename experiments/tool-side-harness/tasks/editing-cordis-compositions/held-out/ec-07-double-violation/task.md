# Task: ec-07-double-violation

## Goal

The preset composition in your workspace (`agent.cordis.yml`) violates the
mount contract twice: a provider publishes its service into the root realm,
and a consumer is left outside the group that owns its service. Diagnose both
failures with the bundled contract checker, repair the composition, and leave
everything else unchanged.

## What you have

Consult the harness documentation available to you (`list_skills` /
`load_skill`) before editing — the checker reports violations, not fixes.

`bash check.sh` reports composition contract violations.

## What to produce

A fixed `agent.cordis.yml` in which `bash check.sh` passes.

## How to verify yourself

Run `bash check.sh` until it reports no violations.
