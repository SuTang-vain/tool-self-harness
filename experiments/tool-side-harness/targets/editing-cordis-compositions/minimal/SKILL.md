---
name: editing-cordis-compositions
description: Use when creating, changing, or validating a Cordis composition for this harness — writing or editing an agent preset, adding or removing a plugin row, deciding whether something belongs to the host composition or to one session, checking whether a preset you authored actually mounts, or diagnosing a row that mounted but contributed nothing.
---

# Editing Cordis compositions

Every capability in this harness is a plugin row in a `cordis.yml`; changing what an agent can do
means changing which rows are composed for it. Two planes decide where an edit belongs: the HOST
composition holds the registries and anything shared across sessions, while an AGENT PRESET holds
what one session contributes. A row that publishes a service must sit behind an `isolate` realm
together with its consumers, or stay in the host composition. Start from a copy of a known-good
preset rather than writing from scratch, and verify with a mount-validation before handing off.
