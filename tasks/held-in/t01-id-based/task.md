# Task: t01-id-based

## Goal

The library at `input/lib/src/char-graph.js` embeds character data as JS literals.
Use the **sg-data-pack** skill to extract that embedded data into a spec-compliant
Data Pack and write it to `input/lib/data/data.json`.

## What you have

- `input/lib/src/char-graph.js` — a minimal id-based character-graph engine. It
  embeds two collections as literals: `chars` (entities) and `edges` (relations).
  It already exports `__fromPack` for the equivalence test.

## What to produce

A single file: `input/lib/data/data.json` containing a valid Data Pack (v1.2 or
v1.3) that:
- has `entities` derived from the embedded `chars` (each with `kind`)
- has `aliases` mapping display names → ids
- has `relationTypes` registering the edge type(s) used
- has `relations` derived from the embedded `edges`
- has `provenance` stamped on entities and relations
- passes `node $SK validate data.json --strict` with zero errors

## How to verify yourself

```bash
SK=~/.zcode/skills/sg-data-pack/scripts/sg-data-pack
node $SK validate input/lib/data/data.json --strict
```

The grader additionally deep-compares your pack's semantic fields
(entities/aliases/relationTypes/relations/provenance) against a reference pack.

## Hint

The skill's standard workflow is: survey the engine → write an extraction config
(`extract.config.template.js`) → run `node $SK extract <config>` which slices the
literals, builds the pack, validates, and equivalence-tests against the engine.
Read the skill before writing anything.
