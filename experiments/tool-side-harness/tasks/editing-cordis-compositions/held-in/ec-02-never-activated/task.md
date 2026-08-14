# Task: ec-02-never-activated

## Goal

The preset composition in your workspace (`agent.cordis.yml`) is broken: the row
`compaction-basic` reads `toolResultPruner` through `ctx.get`, so the pruner must
share its realm. The fixture puts the pruner inside an isolate group but leaves
`compaction-basic` OUTSIDE the group — a consumer left outside the group resolves
the host's registry, which this preset did not populate, so the row never activates.

## What to produce

Fix `agent.cordis.yml` so that:
- `compaction-basic` sits INSIDE the `compaction` group next to `tool-result-pruner`;
- the group keeps its isolate realm `{ compaction: true, toolResultPruner: true }`;
- `compaction-basic` no longer appears loose at the top level;
- nothing else changes.

## How to verify yourself

The grader checks group membership, the isolate realm, and the absence of a loose
top-level copy.
