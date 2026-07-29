# Task: t03-multi-stage

## Goal

The library at `input/lib/src/saga.js` is a **multi-stage** narrative engine:
- Entities (`chars`) are shared across stages.
- Edges are split into `stage1Edges` and `stage2Edges`. The same entity pair
  (`hero`,`ally`) has a DIFFERENT relationship type in each stage (alliance vs
  rivalry).

Use the **sg-data-pack** skill to extract this into a Data Pack at
`input/lib/data/data.json` where:
- `relations` is the **union** of per-stage edges, each tagged with a `scope`
  array (e.g. `["stage1"]`) so E12 disambiguation passes.
- `stages` declares both stages with their entity membership and per-stage
  relation refs.
- `provenance.relations` keys use the `a::b` format (deduped by pair).
- passes `node $SK validate data.json --strict` with zero errors.

## Hint

This is the multi-stage pattern. The skill's `references/data-pack-contract.md`
documents the `scope` field and E12. Read the skill body first.
