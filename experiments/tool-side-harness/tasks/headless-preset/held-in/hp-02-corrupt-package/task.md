# Task: hp-02-corrupt-package

## Goal

The headless-agent composition in your workspace (`agent.cordis.yml`) references
a package that does not resolve. Diagnose the failure with the bundled contract
checker, repair the reference, and leave everything else unchanged.

## What you have

`bash check.sh` reports contract violations.

## What to produce

A fixed `agent.cordis.yml` in which `bash check.sh` passes.

## How to verify yourself

Run `bash check.sh` until it reports no violations.
