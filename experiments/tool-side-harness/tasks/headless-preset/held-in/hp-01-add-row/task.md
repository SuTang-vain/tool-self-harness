# Task: hp-01-add-row

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) does not
satisfy its documented tool surface: one required row is missing. Diagnose the
failure with the bundled contract checker, restore the missing row, and leave
everything else unchanged.

## What you have

`bash check.sh` reports contract violations.

## What to produce

A fixed `agent.cordis.yml` in which `bash check.sh` passes.

## How to verify yourself

Run `bash check.sh` until it reports no violations.
