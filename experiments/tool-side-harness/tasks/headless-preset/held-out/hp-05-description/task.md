# Task: hp-05-description

## Goal

The preset metadata in your workspace (`preset.yml`) does not state what the
headless profile actually does. The description must convey the one-shot
contract: accept one task, run, and exit.

## What to produce

Edit `preset.yml` so the `description` mentions one-shot execution (match
`one-shot`) AND mentions that the agent exits after finishing (match `exit`).
Keep the existing `name`. Do not edit any other file.

## How to verify yourself

The grader regex-checks both required statements in the description.
