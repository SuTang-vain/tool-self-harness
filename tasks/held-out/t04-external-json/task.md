# Task: t04-external-json

## Goal

The library at `input/lib/src/guild.js` gets its default data from an **external
JSON block** in `input/lib/examples/guild.html` (a `<script id="sg-data"
type="application/json">` block containing `{members:[...], bonds:[...]}`).

Use the **sg-data-pack** skill to extract this external data into a Data Pack
at `input/lib/data/data.json` where:
- `entities` are derived from `members` (keyed by `id`, with `name` + `kind`)
- `aliases` map each member's display name -> id
- `relations` are derived from `bonds` (a/b/type)
- `relationTypes` registers the bond types used
- passes `node $SK validate data.json --strict` with zero errors

## Hint

This is the "external-JSON library" pattern documented in the skill's
`references/extraction-config.md`. The literal spec uses `file` + `json: true`
to slice the JSON block from the HTML. Read the skill body first.
