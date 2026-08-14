# Task: hp-04-model-pin

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) has an
inconsistent model registry: an agent references a model that is not registered.
Diagnose the failure with the bundled contract checker, restore consistency, and
leave everything else unchanged.

## What you have

Consult the harness documentation available to you (`list_skills` /
`load_skill`) before editing — the checker reports violations, not fixes.

`bash check.sh` reports contract violations.

`bash check.sh` reports contract violations.

## What to produce

A fixed `agent.cordis.yml` in which `bash check.sh` passes.

## How to verify yourself

Run `bash check.sh` until it reports no violations.
