# Task: ec-03-invalid-config

## Goal

The preset composition in your workspace (`agent.cordis.yml`) is broken: the row
`tool-subagent` is missing its required `provider` config field, so the row's
config is invalid and the composition fails mount validation with
`invalid config: $.<field> missing required value`.

## What to produce

Fix `agent.cordis.yml` so that:
- row `tool-subagent` declares `config.provider: spawn` (keep `toolName` and
  `backgroundMode` as they are);
- nothing else changes.

## How to verify yourself

The grader checks that the row exists with the required config field present.
