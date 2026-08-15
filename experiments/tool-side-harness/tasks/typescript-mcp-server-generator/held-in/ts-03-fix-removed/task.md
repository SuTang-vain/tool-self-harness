# Task: ts-03-fix-removed

## Goal

The server uses a transport that no longer exists in the SDK version the
project depends on. Repair the server to use a supported transport.

## What you have

Consult the harness documentation available to you (`list_skills` /
`load_skill`) before editing — the checker reports generic issues only.

`bash check.sh` reports whether the transport import is supported.

## What to produce

The repaired `src/server.ts`.
