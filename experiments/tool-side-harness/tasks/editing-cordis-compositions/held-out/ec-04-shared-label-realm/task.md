# Task: ec-04-shared-label-realm

## Goal

The preset composition in your workspace (`agent.cordis.yml`) declares an
isolate realm that is not private to each mounting session. Diagnose the
failure with the bundled contract checker, fix the composition, and leave
everything else unchanged.

## What you have

`bash check.sh` reports composition contract violations.

## What to produce

A fixed `agent.cordis.yml` in which `bash check.sh` passes.

## How to verify yourself

Run `bash check.sh` until it reports no violations.
