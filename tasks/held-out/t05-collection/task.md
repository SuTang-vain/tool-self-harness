# Task: t05-collection

## Goal

The library at `input/lib/src/roster.js` is a **collection-page** engine: its
default data is a single `members` array (repeated item group). Each member has
`{id, name, role}`.

Use the **sg-data-pack** skill to extract this into a Data Pack at
`input/lib/data/data.json` where:
- `entities` are derived from `members` (keyed by `id`, with `name` + `kind`)
- `aliases` map each member's display name -> id
- `relations` model each member (e.g. as a self-loop carrying the role as `label`)
- `relationTypes` registers the type used
- passes `node $SK validate data.json --strict` with zero errors

## Hint

This is the "collection / monolith" pattern. The skill's
`references/split-monolith.md` and the `templatize` subcommand are relevant.
Read the skill body first.
