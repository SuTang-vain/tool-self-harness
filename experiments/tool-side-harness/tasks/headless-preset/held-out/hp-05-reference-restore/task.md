# Task: hp-05-reference-restore

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) deviates
from its documented reference state: persistence and compaction settings have
been altered. Restore the composition to match the harness reference exactly,
and leave everything else unchanged.

## What you have

Consult the harness documentation available to you (`list_skills` /
`load_skill`) — the reference state lives there, not in the workspace.

`bash check.sh` runs the general contract checks; it does not localize
deviations from the reference.

## What to produce

A fixed `agent.cordis.yml` matching the documented reference state.
