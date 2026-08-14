# Task: ec-01-realm-missing

## Goal

The preset composition in your workspace (`agent.cordis.yml`) is broken: the row
`workflow-worker-thread` publishes the `workflows` service, but it sits loose in
the preset. A row that publishes a service must not sit loose in a preset — the
second session mounting this preset would collide with the first.

## What to produce

Fix `agent.cordis.yml` so that:
- the provider row `workflow-worker-thread` and its consumer `tool-workflow` sit
  inside ONE `cordis:group` row with `group: true` and an isolate realm
  `{ workflows: true }`;
- neither row remains loose at the top level;
- nothing else changes.

## How to verify yourself

The grader checks row placement, group membership, and the isolate realm. A
loose publisher or a missing realm fails.
