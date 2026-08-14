# Task: hp-01-add-row

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) is missing
the `tool-todo` row, so the agent has no task-tracking tool.

## What to produce

Add the `tool-todo` row back to `agent.cordis.yml` with:
- id `tool-todo`
- config `allowParallelInProgress: true`

Change nothing else.

## How to verify yourself

The grader checks the row exists with the exact config.
