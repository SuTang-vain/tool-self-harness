# Task: ts-04a-fix-errors

## Goal

The error handling uses a class that was retired in the SDK version the
project depends on. Migrate it to the current error hierarchy.

## What you have

Consult the harness documentation available to you (`list_skills` /
`load_skill`) before editing — the checker reports generic issues only.

`bash check.sh` reports whether the retired class is still referenced.

## What to produce

The repaired `src/server.ts`.
