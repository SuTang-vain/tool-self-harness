# Task: hp-04-model-pin

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) pins the
`main` agent to the expensive model: `agent-spine` agents[0] declares
`model: deepseek-v4-pro`. This preset must run on the flash model.

## What to produce

Set the `main` agent's model to `deepseek-v4-flash`. Change nothing else.

## How to verify yourself

The grader navigates the nested agents list and checks the model value.
