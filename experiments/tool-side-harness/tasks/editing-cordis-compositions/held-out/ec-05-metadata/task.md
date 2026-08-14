# Task: ec-05-metadata

## Goal

The preset directory in your workspace is incomplete: its `preset.yml` does not
satisfy the roster contract, so the preset cannot be listed properly. Diagnose
the failure with the bundled contract checker, fix the metadata, and leave
everything else unchanged.

## What you have

`bash check.sh` reports metadata contract violations.

## What to produce

A fixed `preset.yml` in which `bash check.sh` passes.

## How to verify yourself

Run `bash check.sh` until it reports no violations.
