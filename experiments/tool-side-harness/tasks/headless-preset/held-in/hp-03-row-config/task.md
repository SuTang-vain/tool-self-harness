# Task: hp-03-row-config

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) has the
compaction threshold misconfigured: `compaction-basic` declares
`thresholdRatio: 0.9`, which starts compaction too late.

## What to produce

Set `compaction-basic` config `thresholdRatio` to `0.8`. Change nothing else.

## How to verify yourself

The grader checks the exact config value on the row.
