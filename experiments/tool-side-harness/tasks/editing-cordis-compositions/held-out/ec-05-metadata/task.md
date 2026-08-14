# Task: ec-05-metadata

## Goal

A preset directory was just created by `copy()` semantics: the copy keeps the
source's description but DROPS the source's name and roster order. The
`preset.yml` in your workspace currently has no `name`, so the preset would show
up in every picker as its bare directory id.

## What to produce

Edit `preset.yml` so that:
- `name` is present and satisfies the id constraint `[a-z0-9][a-z0-9-]*` (it
  becomes the directory name);
- the `description` keeps stating what the preset does — it must still mention
  the workflow toolchain (match: `workflow`).

Do not create or edit any other file.

## How to verify yourself

The grader checks both fields of `preset.yml`.
