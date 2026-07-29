# Task: t02-chinese-alias

## Goal

The library at `input/lib/src/family-tree.js` embeds character data where:
- Entity keys are stable ids (`zhangsan`, `lisi`, `wangwu`) but each carries a
  Chinese display `name` (`张三`, `李四`, `王五`).
- Relations (`edges`) reference entities by their **display names**, not ids.

Use the **sg-data-pack** skill to extract this into a spec-compliant Data Pack
at `input/lib/data/data.json`. The pack must:
- have `entities` keyed by stable id, each with `kind` + `name`
- have `aliases` mapping each display name -> id (so E4/E5 pass)
- have `relations` whose `a`/`b` are **ids** (not names) - you must convert them
- pass `node $SK validate data.json --strict` with zero errors

## Hint

This is the "Chinese-name-reference library" pattern documented in the skill's
`references/extraction-config.md`. Read the skill body first.
