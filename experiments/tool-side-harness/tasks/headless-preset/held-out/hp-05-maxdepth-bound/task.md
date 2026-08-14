# Task: hp-05-maxdepth-bound

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) violates a
configuration schema bound on a delegation row. Diagnose the failure with the
bundled contract checker, correct the value, and leave everything else unchanged.

## What you have

`bash check.sh` reports contract violations.

## What to produce

A fixed `agent.cordis.yml` in which `bash check.sh` passes.

## How to verify yourself

Run `bash check.sh` until it reports no violations.
