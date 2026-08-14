# Task: ec-04-shared-label-realm

## Goal

The preset composition in your workspace (`agent.cordis.yml`) declares an isolate
realm with a STRING LABEL (`workflows: shared`) instead of `true`. A string label
joins subtrees into one shared realm, and `provide()` still throws on the second
registration under that symbol — a label does not pool instances and is not what a
preset needs.

## What to produce

Fix `agent.cordis.yml` so that the group's isolate realm reads
`workflows: true` (a realm private to each mounting session). Keep the group and
its two rows as they are; change nothing else.

## How to verify yourself

The grader checks the isolate realm value and group membership.
